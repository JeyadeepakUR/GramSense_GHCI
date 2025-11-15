import { useState } from "react";
import { extractEntities } from "@core";

interface Entity {
  type: string;
  text: string;
  start: number;
  end: number;
  score?: number;
}

interface Intent {
  name: string;
  score: number;
}

interface AnalysisResult {
  intents: Intent[];
  entities: Entity[];
}

export interface TranscriptAnalyzerProps {
  initialTranscript?: string;
}

export default function TranscriptAnalyzer({
  initialTranscript = "",
}: TranscriptAnalyzerProps) {
  const [text, setText] = useState(initialTranscript);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );

  // Analyze text for intents and entities
  const analyzeText = () => {
    if (!text.trim()) {
      setAnalysisResult(null);
      return;
    }

    try {
      // Call core NLU function
      const result = extractEntities(text);

      setAnalysisResult(result);

      // Log results
      console.log("Detected Intents:", result.intents);
      console.log("Found Entities:", result.entities);
    } catch (error) {
      console.error("Analysis failed:", error);
      setAnalysisResult(null);
    }
  };

  // Highlight entities in text
  const renderHighlightedText = () => {
    if (!analysisResult || analysisResult.entities.length === 0) {
      return text;
    }

    const entities = analysisResult.entities;
    const parts: Array<{ text: string; type?: string }> = [];
    let lastEnd = 0;

    // Sort entities by start position
    const sortedEntities = [...entities].sort((a, b) => a.start - b.start);

    for (const entity of sortedEntities) {
      if (entity.start > lastEnd) {
        parts.push({ text: text.slice(lastEnd, entity.start) });
      }
      parts.push({ text: entity.text, type: entity.type });
      lastEnd = entity.end;
    }

    if (lastEnd < text.length) {
      parts.push({ text: text.slice(lastEnd) });
    }

    return parts.map((part, i) => (
      <span
        key={i}
        style={
          part.type
            ? {
                backgroundColor:
                  part.type === "date"
                    ? "#fff3bf"
                    : part.type === "number"
                      ? "#c3fac3"
                      : "#e7f5ff",
                fontWeight: "bold",
                borderRadius: "3px",
                padding: "2px 4px",
              }
            : {}
        }
        title={part.type ? `Type: ${part.type}` : ""}
      >
        {part.text}
      </span>
    ));
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h3>📝 Transcript Analyzer (NLU)</h3>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter transcript or voice-recognized text to analyze..."
        style={{
          width: "100%",
          height: "100px",
          padding: "10px",
          borderRadius: "4px",
          border: "1px solid #ddd",
          fontFamily: "monospace",
          fontSize: "14px",
          boxSizing: "border-box",
        }}
      />

      <button
        onClick={analyzeText}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        🔍 Analyze
      </button>

      {analysisResult && (
        <div style={{ marginTop: "20px" }}>
          {/* Intents Section */}
          {analysisResult.intents.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <h4>🎯 Detected Intents:</h4>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {analysisResult.intents.map((intent, i) => (
                  <li
                    key={i}
                    style={{
                      padding: "8px",
                      backgroundColor: "#f0f0f0",
                      marginBottom: "8px",
                      borderRadius: "4px",
                    }}
                  >
                    <strong>{intent.name}</strong> (confidence:{" "}
                    {(intent.score * 100).toFixed(0)}%)
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Entities Section */}
          {analysisResult.entities.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <h4>🏷️ Extracted Entities:</h4>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {analysisResult.entities.map((entity, i) => (
                  <li
                    key={i}
                    style={{
                      padding: "8px",
                      backgroundColor:
                        entity.type === "date"
                          ? "#fffacd"
                          : entity.type === "number"
                            ? "#f0fff0"
                            : "#f0f8ff",
                      marginBottom: "8px",
                      borderRadius: "4px",
                      borderLeft: `4px solid ${
                        entity.type === "date"
                          ? "#ffd700"
                          : entity.type === "number"
                            ? "#90ee90"
                            : "#87ceeb"
                      }`,
                    }}
                  >
                    <strong>Type:</strong> {entity.type} | <strong>Text:</strong>{" "}
                    "{entity.text}"
                    {entity.score && (
                      <>
                        {" "}
                        | <strong>Confidence:</strong>{" "}
                        {(entity.score * 100).toFixed(0)}%
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Highlighted Text */}
          <div style={{ marginTop: "20px" }}>
            <h4>✨ Highlighted Text:</h4>
            <div
              style={{
                padding: "12px",
                backgroundColor: "#f9f9f9",
                borderRadius: "4px",
                lineHeight: "1.6",
              }}
            >
              {renderHighlightedText()}
            </div>
          </div>
        </div>
      )}

      {text.trim() && !analysisResult && (
        <p style={{ marginTop: "10px", color: "#666" }}>
          Click "Analyze" to extract intents and entities
        </p>
      )}
    </div>
  );
}
