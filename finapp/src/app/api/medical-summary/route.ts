import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { NextRequest, NextResponse } from "next/server";
import { prompts } from "@/lib/prompts";

const bedrockClient = new BedrockRuntimeClient({
  region: "us-east-1",
});

export async function POST(request: NextRequest) {
  try {
    const { pdfText } = await request.json();

    const prompt = `${prompts.pdfAssistant}\n\nHuman: ${prompts.pdfUser}\n\nDocument:\n${pdfText}\n\nAssistant:`;

    const command = new InvokeModelCommand({
      modelId: "us.anthropic.claude-3-7-sonnet-20250219-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    return NextResponse.json({
      message: responseBody.content[0].text,
      success: true,
    });
  } catch (error) {
    console.error("Error calling Bedrock:", error);
    return NextResponse.json(
      { error: "Failed to analyze medical document" },
      { status: 500 }
    );
  }
}