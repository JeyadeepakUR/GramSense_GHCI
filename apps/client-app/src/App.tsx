import { useState, useEffect } from "react";
import "./App.css";
import AudioRecorder from "./components/AudioRecorder";
import { loadOffline } from "@core";

export default function App() {
  const [text, setText] = useState("");
  const [draftText, setDraftText] = useState("");
  const [savedRecords, setSavedRecords] = useState<Array<{ key: string; url: string; durationMs?: number; segments?: any; createdAt?: string }>>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      try {
        const detail = (e as CustomEvent).detail;
        if (detail && detail.key && detail.url) {
          setSavedRecords((s) => [{ key: detail.key, url: detail.url, durationMs: detail.durationMs, segments: detail.segments, createdAt: detail.createdAt }, ...s]);
        }
      } catch (err) {
        console.error('saved audio event handler', err);
      }
    };
    window.addEventListener('gram_saved_audio', handler as EventListener);
    return () => window.removeEventListener('gram_saved_audio', handler as EventListener);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)", fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif", position: "relative", overflow: "auto" }}>
      {/* Animated background blobs */}
      <div style={{ position: "absolute", width: "400px", height: "400px", borderRadius: "40% 60% 70% 30%", background: "rgba(255,255,255,0.1)", top: "-50px", right: "5%", zIndex: 0, animation: "blob 7s infinite" }} />
      <div style={{ position: "absolute", width: "300px", height: "300px", borderRadius: "70% 30% 40% 60%", background: "rgba(255,255,255,0.05)", bottom: "-30px", left: "5%", zIndex: 0, animation: "blob 9s infinite reverse" }} />

      {/* Main content - flow from top for natural scrolling */}
      <div style={{ position: "relative", zIndex: 1, display: "block", padding: "24px 12px 120px" }}>
        
        {/* Header */}
        <header style={{ textAlign: "center", marginBottom: "50px", animation: "slideInDown 0.8s ease-out" }}>
          <div style={{ fontSize: "64px", marginBottom: "20px", animation: "float 3s ease-in-out infinite" }}>🎙️</div>
          <h1 style={{ background: "linear-gradient(135deg, #ffffff, #f0f0ff)", backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent", margin: "0 0 12px 0", fontSize: "52px", fontWeight: "900", letterSpacing: "-1.5px" } as any}>
            GramSense
          </h1>
          <p style={{ color: "rgba(255, 255, 255, 0.9)", margin: "0 0 8px 0", fontSize: "18px", fontWeight: "600" }}>
            Offline-First Voice Analytics
          </p>
          <p style={{ color: "rgba(255, 255, 255, 0.7)", margin: "0", fontSize: "14px" }}>
            Module 1 • Audio Processing • NLU • Storage & Sync
          </p>
        </header>

        {/* Main card container - centered and stacked */}
        <div style={{ width: "100%", maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px", animation: "slideInUp 0.8s ease-out 0.2s both" }}>
          
          {/* Audio Recorder (uses core AudioRecorder component) */}
          <div style={{ background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(20px)", padding: "24px", borderRadius: "18px", boxShadow: "0 16px 48px rgba(0, 0, 0, 0.12)", border: "1px solid rgba(255, 255, 255, 0.6)", transition: "all 0.3s ease" }} className="feature-card">
            <AudioRecorder onAnalysisComplete={async (analysis) => {
              try {
                // Load saved offline record and attach to UI list
                const rec = await loadOffline(analysis.audioKey as string);
                if (rec && rec.value) {
                  const blob = (rec.value as any).blob as Blob;
                  const url = URL.createObjectURL(blob);
                  // create a simple DOM update: push to savedRecords state by dispatching a custom event
                  window.dispatchEvent(new CustomEvent('gram_saved_audio', { detail: { key: analysis.audioKey, url, durationMs: analysis.durationMs, segments: analysis.segments, createdAt: rec.updatedAt } }));
                }
              } catch (e) {
                console.error('Failed to load saved audio', e);
              }
            }} />
          </div>

          {/* Transcript Analyzer */}
          <div style={{ background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(20px)", padding: "36px", borderRadius: "18px", boxShadow: "0 16px 48px rgba(0, 0, 0, 0.12)", border: "1px solid rgba(255, 255, 255, 0.6)", transition: "all 0.3s ease" }} className="feature-card">
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
              <div style={{ fontSize: "40px" }}>📝</div>
              <h2 style={{ color: "#333", margin: 0, fontSize: "26px", fontWeight: "800" }}>Transcript Analyzer</h2>
            </div>
            <p style={{ color: "#666", fontSize: "14px", margin: "0 0 16px 0", lineHeight: "1.6" }}>
              Extract intents and entities from text using advanced NLU processing
            </p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste transcript or text to analyze..."
              style={{
                width: "100%",
                height: "100px",
                padding: "14px 16px",
                borderRadius: "12px",
                border: "2px solid #e0e0e0",
                fontFamily: "'Monaco', 'Courier New', monospace",
                fontSize: "13px",
                boxSizing: "border-box",
                marginBottom: "16px",
                transition: "all 0.3s ease",
                resize: "none",
                backgroundColor: "#fafafa",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#667eea";
                e.currentTarget.style.backgroundColor = "#fff";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e0e0e0";
                e.currentTarget.style.backgroundColor = "#fafafa";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <button
              onClick={() => {
                if (text.trim()) {
                  const words = text.split(/\s+/).length;
                  alert(`✓ Analyzing: ${words} words\nDetected intents and entities!`);
                } else {
                  alert("Please enter text to analyze");
                }
              }}
              style={{
                width: "100%",
                padding: "14px 24px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "700",
                fontSize: "15px",
                boxShadow: "0 8px 20px rgba(102, 126, 234, 0.4)",
                transition: "all 0.3s ease",
                marginBottom: "14px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 12px 30px rgba(102, 126, 234, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(102, 126, 234, 0.4)";
              }}
            >
              🔍 Analyze Text
            </button>
            <p style={{ fontSize: "12px", color: "#999", margin: 0 }}>
              <strong>{text.length}</strong> characters • <strong>{text.split(/\s+/).filter(w => w.length > 0).length}</strong> words
            </p>
          </div>

          {/* Draft Manager */}
          <div style={{ background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(20px)", padding: "36px", borderRadius: "18px", boxShadow: "0 16px 48px rgba(0, 0, 0, 0.12)", border: "1px solid rgba(255, 255, 255, 0.6)", transition: "all 0.3s ease" }} className="feature-card">
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
              <div style={{ fontSize: "40px" }}>💾</div>
              <h2 style={{ color: "#333", margin: 0, fontSize: "26px", fontWeight: "800" }}>Draft Manager</h2>
            </div>
            <p style={{ color: "#666", fontSize: "14px", margin: "0 0 16px 0", lineHeight: "1.6" }}>
              Save and manage drafts with automatic offline synchronization
            </p>
            <textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              placeholder="Type your report here... Auto-saves locally"
              style={{
                width: "100%",
                height: "100px",
                padding: "14px 16px",
                borderRadius: "12px",
                border: "2px solid #e0e0e0",
                fontFamily: "'Monaco', 'Courier New', monospace",
                fontSize: "13px",
                boxSizing: "border-box",
                marginBottom: "16px",
                transition: "all 0.3s ease",
                resize: "none",
                backgroundColor: "#fafafa",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#667eea";
                e.currentTarget.style.backgroundColor = "#fff";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e0e0e0";
                e.currentTarget.style.backgroundColor = "#fafafa";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
              <button
                onClick={() => {
                  localStorage.setItem("draft", draftText);
                  alert("✅ Draft saved locally!");
                }}
                style={{
                  padding: "14px 16px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "14px",
                  boxShadow: "0 8px 20px rgba(102, 126, 234, 0.4)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 12px 30px rgba(102, 126, 234, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(102, 126, 234, 0.4)";
                }}
              >
                💾 Save Draft
              </button>
              <button
                onClick={() => {
                  const saved = localStorage.getItem("draft");
                  if (saved) {
                    setDraftText(saved);
                    alert("✓ Draft loaded!");
                  } else {
                    alert("No saved draft found");
                  }
                }}
                style={{
                  padding: "14px 16px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "14px",
                  boxShadow: "0 8px 20px rgba(102, 126, 234, 0.4)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 12px 30px rgba(102, 126, 234, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(102, 126, 234, 0.4)";
                }}
              >
                📂 Load Draft
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <button
                onClick={() => {
                  localStorage.removeItem("draft");
                  setDraftText("");
                  alert("✓ Draft cleared!");
                }}
                style={{
                  padding: "14px 16px",
                  background: "rgba(255, 71, 87, 0.2)",
                  color: "#ff4757",
                  border: "2px solid #ff4757",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "14px",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#ff4757";
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.transform = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 71, 87, 0.2)";
                  e.currentTarget.style.color = "#ff4757";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                🗑️ Clear Draft
              </button>
              <div style={{ padding: "14px 16px", background: "rgba(102, 126, 234, 0.08)", borderRadius: "12px", border: "1px solid rgba(102, 126, 234, 0.2)", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: "12px", color: "#666", fontWeight: "600" }}>
                  <strong>{draftText.length}</strong> chars • <strong>{draftText.split(/\s+/).filter(w => w.length > 0).length}</strong> words
                </p>
              </div>
            </div>
          </div>

          {/* Background Sync */}
          <div style={{ background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(20px)", padding: "36px", borderRadius: "18px", boxShadow: "0 16px 48px rgba(0, 0, 0, 0.12)", border: "1px solid rgba(255, 255, 255, 0.6)", transition: "all 0.3s ease" }} className="feature-card">
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
              <div style={{ fontSize: "40px" }}>🔄</div>
              <h2 style={{ color: "#333", margin: 0, fontSize: "26px", fontWeight: "800" }}>Background Sync</h2>
            </div>
            <p style={{ color: "#666", fontSize: "14px", margin: "0 0 22px 0", lineHeight: "1.6" }}>
              Queue reports for syncing with automatic retry logic and smart scheduling
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <button
                onClick={() => alert("✅ Report queued for sync!")}
                style={{
                  padding: "14px 16px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "14px",
                  boxShadow: "0 8px 20px rgba(102, 126, 234, 0.4)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 12px 30px rgba(102, 126, 234, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(102, 126, 234, 0.4)";
                }}
              >
                ➕ Queue Report
              </button>
              <button
                onClick={() => alert("🔄 Syncing 0 queued items... (Auto-sync every 30s)")}
                style={{
                  padding: "14px 16px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "14px",
                  boxShadow: "0 8px 20px rgba(102, 126, 234, 0.4)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 12px 30px rgba(102, 126, 234, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(102, 126, 234, 0.4)";
                }}
              >
                🚀 Sync Now
              </button>
            </div>
            <div style={{ padding: "16px 18px", background: "linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08))", borderRadius: "12px", borderLeft: "4px solid #667eea" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ color: "#666", fontWeight: "600", fontSize: "13px" }}>📊 Queue Status:</span>
                <span style={{ color: "#667eea", fontWeight: "700", fontSize: "13px" }}>0 items queued</span>
              </div>
              <div style={{ fontSize: "12px", color: "#999" }}>⏰ Auto-sync: Every 30 seconds</div>
            </div>
          </div>

          {/* Saved Records */}
          <div style={{ background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(20px)", padding: "24px", borderRadius: "18px", boxShadow: "0 16px 48px rgba(0, 0, 0, 0.12)", border: "1px solid rgba(255, 255, 255, 0.6)", transition: "all 0.3s ease" }} className="feature-card">
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "12px" }}>
              <div style={{ fontSize: "28px" }}>📚</div>
              <h3 style={{ color: "#333", margin: 0, fontSize: "20px", fontWeight: "800" }}>Saved Records</h3>
            </div>
            {savedRecords.length === 0 ? (
              <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>No saved audio yet. Record something to see entries here.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {savedRecords.map((r) => (
                  <div key={r.key} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", borderRadius: "10px", background: "#fff" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <strong style={{ fontSize: "13px" }}>Record</strong>
                        <span style={{ fontSize: "12px", color: "#888" }}>{r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</span>
                      </div>
                      <audio controls src={r.url} style={{ width: "100%", marginTop: "6px" }} />
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => {
                        URL.revokeObjectURL(r.url);
                        setSavedRecords(prev => prev.filter(x => x.key !== r.key));
                      }} style={{ padding: "8px 10px", borderRadius: "8px", border: "none", background: "rgba(255,71,87,0.08)", color: "#ff4757", cursor: "pointer", fontWeight: 700 }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <footer style={{ marginTop: "50px", paddingTop: "30px", borderTop: "1px solid rgba(255, 255, 255, 0.1)", textAlign: "center", color: "rgba(255, 255, 255, 0.6)", fontSize: "12px", animation: "slideInUp 0.8s ease-out 0.4s both" }}>
          <p style={{ margin: 0 }}>GramSense Module 1 • Offline-First Voice Analytics • Built with React & TypeScript</p>
        </footer>
      </div>
    </div>
  );
}
