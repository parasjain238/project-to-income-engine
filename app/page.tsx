"use client";
import { useState } from "react";

export default function Home() {
  const [idea, setIdea] = useState("");
  const [refine, setRefine] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ projectIdea: idea })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const refineAnalysis = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          projectIdea: idea + " | refinement: " + refine
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-4xl mx-auto text-white">
      <h1 className="text-4xl font-bold mb-6 text-center">
        🚀 Project-to-Income Engine
      </h1>

      {/* Input */}
      <textarea
        className="border border-white/20 p-3 w-full mb-4 rounded bg-black text-white"
        placeholder="Describe your project..."
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
      />

      {/* Analyze Button */}
      <button
        onClick={analyze}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-2 rounded w-full"
      >
        {loading ? (
          <span className="animate-pulse">Analyzing...</span>
        ) : (
          "Analyze Project"
        )}
      </button>

      {/* Error */}
      {error && (
        <p className="text-red-500 mt-4 text-center">{error}</p>
      )}

      {/* Result */}
      {result && (
        <div className="mt-8 space-y-6">

          {/* Score */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-4 rounded shadow">
            <h2 className="text-xl font-bold">
              Score: {result.score}/10
            </h2>
            <p className="mt-2">{result.verdict}</p>

            {/* Confidence Meter */}
            <div className="mt-3">
              <div className="w-full bg-gray-600 h-2 rounded">
                <div
                  className="bg-green-500 h-2 rounded"
                  style={{ width: `${result.score * 10}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">
              💰 Revenue Estimate
            </h2>
            <p>Conservative: {result.revenue?.conservative}</p>
            <p>Realistic: {result.revenue?.realistic}</p>
            <p>Optimistic: {result.revenue?.optimistic}</p>
          </div>

          {/* Suggestions */}
          <div>
            <h2 className="text-xl font-bold mb-2">
              🚀 Monetization Ideas
            </h2>

            {result.suggestions?.map((s: any, i: number) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-lg border border-white/20 p-4 rounded mb-4 shadow"
              >
                <h3 className="text-lg font-bold mb-1">{s.title}</h3>
                <p><strong>Model:</strong> {s.model}</p>
                <p><strong>Target:</strong> {s.targetUsers}</p>
                <p><strong>Pricing:</strong> {s.pricing}</p>

                <ul className="list-disc ml-5 mt-2">
                  {s.steps?.map((step: string, idx: number) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Refine */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">
              🔄 Refine Suggestions
            </h2>

            <input
              className="border border-white/20 p-2 w-full mb-2 rounded bg-black text-white"
              placeholder="e.g. focus on passive income, India market..."
              value={refine}
              onChange={(e) => setRefine(e.target.value)}
            />

            <button
              onClick={refineAnalysis}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 transition text-white px-4 py-2 rounded w-full"
            >
              {loading ? (
                <span className="animate-pulse">Refining...</span>
              ) : (
                "Refine Results"
              )}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}