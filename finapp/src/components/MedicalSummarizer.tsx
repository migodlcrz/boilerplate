"use client";

import { useState, useRef } from "react";
import jsPDF from "jspdf";
import { motion } from "framer-motion";

export default function MedicalSummarizer() {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadSummaryPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    const lineHeight = 6;

    doc.setFontSize(16);
    doc.text("Medical Document Summary", margin, 30);

    if (uploadedFile) {
      doc.setFontSize(12);
      doc.text(`Source: ${uploadedFile}`, margin, 45);
    }

    doc.setFontSize(10);
    const cleanText = summary.replace(/[#*•-]/g, '').replace(/\n\s*\n/g, '\n');
    const lines = doc.splitTextToSize(cleanText, maxWidth);
    
    let yPosition = 60;
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    });

    doc.save(`medical-summary-${uploadedFile || "document"}.pdf`);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setSummary("");

    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const uploadResponse = await fetch("/api/upload-pdf", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();
      if (!uploadData.success) throw new Error(uploadData.error);

      setUploadedFile(uploadData.filename);

      const analysisResponse = await fetch("/api/medical-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfText: uploadData.text }),
      });

      const analysisData = await analysisResponse.json();
      if (analysisData.success) {
        setSummary(analysisData.message);
      } else {
        throw new Error(analysisData.error);
      }
    } catch (error) {
      setSummary("Failed to process medical document. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatSummary = (content: string) => {
    return content.split("\n").map((line, index) => {
      if (line.startsWith("# ")) {
        return (
          <div key={index} className="text-lg font-bold mb-3 mt-2">
            {line.slice(2)}
          </div>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <div key={index} className="text-base font-bold mb-2 mt-2">
            {line.slice(3)}
          </div>
        );
      }
      if (line.startsWith("### ")) {
        return (
          <div key={index} className="text-sm font-bold mb-2 mt-1">
            {line.slice(4)}
          </div>
        );
      }
      if (line.startsWith("• ") || line.startsWith("- ")) {
        return (
          <div key={index} className="ml-4 mb-1">
            • {line.slice(2)}
          </div>
        );
      }
      if (line.includes("**")) {
        const parts = line.split("**");
        return (
          <div key={index} className="mb-1">
            {parts.map((part, i) =>
              i % 2 === 1 ? (
                <span key={i} className="font-semibold">
                  {part}
                </span>
              ) : (
                part
              )
            )}
          </div>
        );
      }
      if (line.trim() === "") {
        return <div key={index} className="mb-2"></div>;
      }
      return (
        <div key={index} className="mb-1">
          {line}
        </div>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col bg-white shadow-md rounded-xl w-full max-w-6xl h-[80%]"
    >
      <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-rose-800 border-b px-6 py-4">
        <h1 className="text-2xl font-bold text-white">
          Medical Evidence Specialist
        </h1>
        <p className="text-sm text-white mt-1">
          VA Benefits Medical Document Analysis
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {!summary && !isLoading && (
          <div className="text-center text-gray-400 mt-8">
            <h3 className="text-lg font-medium">
              Upload medical documents for VA benefits analysis
            </h3>
            <p className="text-sm text-gray-400 mt-2">
              Specialized medical evidence extraction for veterans
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center items-center mt-8">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-rose-600 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-rose-700 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-rose-800 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
              <span className="text-sm text-gray-500">
                Analyzing medical document...
              </span>
            </div>
          </div>
        )}

        {summary && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            {uploadedFile && (
              <div className="flex items-center mb-4 pb-4 border-b">
                <svg
                  className="w-5 h-5 text-blue-600 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 18h12V6l-4-4H4v16zm8-14v4h4l-4-4z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  {uploadedFile}
                </span>
              </div>
            )}
            <div className="text-sm text-gray-900">
              {formatSummary(summary)}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex justify-center gap-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePdfUpload}
            accept=".pdf"
            className="hidden"
          />
          {summary && (
            <button
              onClick={downloadSummaryPDF}
              className="bg-green-600 text-white px-8 py-3 font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Download Summary PDF
            </button>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="bg-gradient-to-r from-rose-600 via-rose-700 to-rose-800 hover:opacity-80 font-semibold text-white px-8 py-3 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Upload Medical Document
          </button>
        </div>
      </div>
    </motion.div>
  );
}
