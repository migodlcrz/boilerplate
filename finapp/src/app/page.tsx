"use client";

import ChatInterface from "@/components/ChatInterface";
import MedicalSummarizer from "@/components/MedicalSummarizer";
import { useState } from "react";

type View = "chat" | "summarizer";

export default function Home() {
  const [view, setView] = useState<View>("chat");
  return (
    <div className="flex flex-col h-screen items-center justify-center bg-slate-200 gap-4">
      <div className="flex flex-row w-full max-w-6xl bg-white p-2">
        <button
          className={`w-1/2 text-gray-700 py-1 font-semibold ${
            view === "chat" && "bg-blue-600 text-white"
          }`}
          onClick={() => setView("chat")}
        >
          Chat Bot
        </button>
        <button
          className={`w-1/2 text-gray-700 py-1 font-semibold ${
            view === "summarizer" && "bg-blue-600 text-white"
          }`}
          onClick={() => setView("summarizer")}
        >
          Medical Summarizer
        </button>
      </div>

      {view === "chat" && <ChatInterface />}
      {view === "summarizer" && <MedicalSummarizer />}
    </div>
  );
}
