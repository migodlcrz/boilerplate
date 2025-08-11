"use client";

import ChatInterface from "@/components/ChatInterface";
import MedicalSummarizer from "@/components/MedicalSummarizer";
import Logo from "../../public/trajector-logo.png";
import { useState } from "react";
import Image from "next/image";

type View = "chat" | "summarizer";

export default function Home() {
  const [view, setView] = useState<View>("chat");
  return (
    <div className="flex flex-col h-screen w-screen">
      <div className="flex items-center px-6 h-[6%] bg-white">
        <Image
          src={Logo}
          alt="Trajector Logo"
          className="h-6 w-auto"
          priority
        />
      </div>
      <div className="flex flex-col h-[94%] items-center justify-center bg-gradient-to-r from-gray-100 via-purple-100 to-pink-100 gap-4">
        <div className="flex flex-row w-full max-w-6xl bg-white p-2 gap-2">
          <button
            className={`w-1/2 text-gray-700 py-2 font-semibold transition-colors duration-300 ease-in-out ${
              view === "chat"
                ? "bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white"
                : "hover:bg-slate-200"
            }`}
            onClick={() => setView("chat")}
          >
            AI Assistant
          </button>
          <button
            className={`w-1/2 text-gray-700 py-2 font-semibold transition-colors duration-300 ease-in-out ${
              view === "summarizer"
                ? "bg-gradient-to-r from-rose-600 via-rose-700 to-rose-800 text-white"
                : "hover:bg-slate-200"
            }`}
            onClick={() => setView("summarizer")}
          >
            Medical Summarizer
          </button>
        </div>

        {view === "chat" && <ChatInterface />}
        {view === "summarizer" && <MedicalSummarizer />}
      </div>
    </div>
  );
}
