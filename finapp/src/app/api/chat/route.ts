import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { NextRequest, NextResponse } from "next/server";

const bedrockClient = new BedrockRuntimeClient({
  region: "us-east-1",
});

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory, imageData } = await request.json();

    const conversationContext = conversationHistory
      .map(
        (msg: any) =>
          `${msg.role === "user" ? "Human" : "Assistant"}: ${msg.content}`
      )
      .join("\n");

    const prompt = conversationContext
      ? `${conversationContext}\n\nHuman: ${message}\n\nAssistant:`
      : `Human: ${message}\n\nAssistant:`;

    const content: any[] = [
      {
        type: "text",
        text: prompt,
      },
    ];

    if (imageData) {
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: imageData.type,
          data: imageData.data,
        },
      });
    }

    const command = new InvokeModelCommand({
      modelId: "us.anthropic.claude-3-7-sonnet-20250219-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: content,
          },
        ],
      }),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    const assistantMessage = responseBody.content[0].text;

    return NextResponse.json({
      message: assistantMessage,
      success: true,
    });
  } catch (error) {
    console.error("Error calling Bedrock:", error);
    return NextResponse.json(
      {
        error: "Failed to get response from AI",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
