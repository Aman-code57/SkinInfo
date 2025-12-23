"use client";

import { useRef, useState, useCallback } from "react";
import ResultCard from "./ResultCard";
import Image from "next/image";

// --- Types ---
type DiseaseLabel = "akiec" | "bcc" | "bkl" | "df" | "mel" | "nv" | "vasc";

interface AnalysisResult {
  label: DiseaseLabel;
  confidence: number;
  probs: Partial<Record<DiseaseLabel, number>>;
}

// --- Component ---
export default function ImageAnalysisUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_ENDPOINT = "http://127.0.0.1:8000/predict";

  // File selection handler
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;

      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);

      if (file) {
        setImageFile(file);
        setImagePreviewUrl(URL.createObjectURL(file));
        setError(null);
        setAnalysisResult(null);
      } else {
        setImageFile(null);
        setImagePreviewUrl(null);
      }
    },
    [imagePreviewUrl],
  );

  // Submit analysis
  const handleAnalysisSubmission = useCallback(async () => {
    if (!imageFile) {
      setError("Please select an image file.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? "API endpoint not found (404)."
            : `Server error: ${response.status}`,
        );
      }

      const data: AnalysisResult = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);

  const buttonText = isLoading
    ? "Processing..."
    : analysisResult
      ? "Re-run Analysis"
      : "Execute AI Analysis";

  const buttonClasses =
    "w-full mt-8 py-4 rounded-xl text-lg font-extrabold text-white transition shadow-xl " +
    (isLoading || !imageFile
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:opacity-90 active:scale-[0.98]");

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ------------------ MAIN BACKGROUND ------------------ */}
      <div
        className="absolute top-0.5 inset-0 bg-cover bg-center opacity-100"
        style={{
          backgroundImage: "url('/background.jpg')",
        }}
      ></div>

      {/* LEFT SKIN CARE IMAGE */}
      <div className="absolute left-8 top-40 w-60 h-60 rounded-full overflow-hidden shadow-2xl border-4 border-white/50">
        <Image src="/left.jpg" alt="" fill className="object-cover" />
      </div>

      <div className="absolute right-10 top-44 w-64 h-64 rounded-full overflow-hidden shadow-2xl border-4 border-white/40">
        <Image
          src="/righte.jpg"
          alt=""
          fill
          className="object-cover opacity-90"
        />
      </div>

      {/* ------------------ CONTENT WRAPPER ------------------ */}
      <div className="relative z-10 flex flex-col items-center py-20 px-4">
        {/* HEADER */}
        <header className="text-center mb-16">
          <h1
            className="text-7xl md:text-6xl font-extrabold tracking-tight leading-none
                          bg-clip-text text-transparent
                          bg-gradient-to-r from-teal-400 via-cyan-500 to-purple-600"
          >
            SKININFO
          </h1>

          <p className="text-gray-800 mt-4 text-xl max-w-xl mx-auto font-semibold">
            Upload a dermatoscopic image for rapid, AI-driven preliminary
            diagnosis.
          </p>
        </header>

        {/* ------------------ CARD ------------------ */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 w-full max-w-xl border border-white/40">
          {/* Upload Box */}
          <label className="block text-gray-800 font-bold mb-3">
            Select Lesion Image (.jpg, .png)
          </label>

          <div className="border-2 border-dashed border-teal-400 rounded-xl bg-white/60 p-4 flex justify-between items-center">
            <span className="text-gray-600">
              {imageFile ? imageFile.name : "No file chosen"}
            </span>

            <button
              className="px-4 py-2 bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-600"
              onClick={() => fileInputRef.current?.click()}
            >
              File
            </button>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
            />
          </div>

          {/* Preview */}
          {imagePreviewUrl && (
            <div className="mt-10 flex flex-col items-center border-t pt-6">
              <h3 className="text-xl font-bold text-purple-600 mb-4">
                Image Review
              </h3>
              <Image
                src={imagePreviewUrl}
                width={288}
                height={288}
                className="object-cover rounded-2xl shadow-xl border-4 border-white"
                alt="Preview"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-6 bg-red-100 text-red-800 border border-red-500 rounded-xl p-4 text-center font-semibold">
              ⚠️ {error}
            </div>
          )}

          {/* Button */}
          <button className={buttonClasses} onClick={handleAnalysisSubmission}>
            {buttonText}
          </button>
        </div>

        {/* Results */}
        {analysisResult && (
          <div className="mt-14 w-full max-w-xl animate-fadeIn">
            <ResultCard result={analysisResult} />
          </div>
        )}

        {/* Disclaimer */}
        <footer className="mt-14 text-center text-gray-700 text-sm max-w-xl border-t pt-6">
          <span className="font-bold text-purple-700">Crucial Disclaimer:</span>{" "}
          This tool provides preliminary insights only. It must not replace a
          professional medical diagnosis.
        </footer>
      </div>
    </div>
  );
}
