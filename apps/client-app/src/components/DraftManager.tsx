import { useState, useEffect } from "react";
import { saveOffline, loadOffline, removeOffline } from "@core";

interface Draft {
  text: string;
  timestamp: number;
  type: "report" | "note";
}

export default function DraftManager() {
  const [draftText, setDraftText] = useState("");
  const [draftType, setDraftType] = useState<"report" | "note">("report");
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const DRAFT_KEY = "current_draft";

  // Load saved draft on mount
  useEffect(() => {
    loadDraft();
  }, []);

  // Load draft from offline storage
  const loadDraft = async () => {
    try {
      const record = await loadOffline<Draft>(DRAFT_KEY);
      if (record) {
        setDraftText(record.value.text);
        setDraftType(record.value.type);
        console.log("✓ Draft loaded from offline storage");
      }
    } catch (error) {
      console.error("Failed to load draft:", error);
    }
  };

  // Save draft offline
  const saveDraft = async () => {
    if (!draftText.trim()) {
      alert("Cannot save empty draft");
      return;
    }

    try {
      await saveOffline<Draft>(DRAFT_KEY, {
        text: draftText,
        timestamp: Date.now(),
        type: draftType,
      });

      const now = new Date().toLocaleTimeString();
      setLastSaved(now);
      console.log(`✓ Draft saved offline at ${now}`);

      // Show temporary success message
      setTimeout(() => setLastSaved(null), 3000);
    } catch (error) {
      console.error("Failed to save draft:", error);
      alert("Failed to save draft");
    }
  };

  // Clear draft
  const clearDraft = async () => {
    if (!confirm("Clear the current draft?")) return;

    try {
      const success = await removeOffline(DRAFT_KEY);
      if (success) {
        setDraftText("");
        setLastSaved(null);
        console.log("✓ Draft cleared");
      }
    } catch (error) {
      console.error("Failed to clear draft:", error);
      alert("Failed to clear draft");
    }
  };

  // Auto-save on interval
  useEffect(() => {
    if (!draftText.trim()) return;

    const autoSaveInterval = setInterval(() => {
      saveDraft();
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [draftText, draftType]);

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h3>📄 Draft Manager (Offline Storage)</h3>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ marginRight: "20px" }}>
          <strong>Draft Type:</strong>
          <select
            value={draftType}
            onChange={(e) => setDraftType(e.target.value as "report" | "note")}
            style={{ marginLeft: "10px", padding: "5px" }}
          >
            <option value="report">Report</option>
            <option value="note">Note</option>
          </select>
        </label>
      </div>

      <textarea
        value={draftText}
        onChange={(e) => setDraftText(e.target.value)}
        placeholder="Type your draft report or note here... (auto-saves every 30 seconds)"
        style={{
          width: "100%",
          height: "150px",
          padding: "10px",
          borderRadius: "4px",
          border: "1px solid #ddd",
          fontFamily: "monospace",
          fontSize: "14px",
          boxSizing: "border-box",
        }}
      />

      <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
        <button
          onClick={saveDraft}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          💾 Save Draft
        </button>
        <button
          onClick={clearDraft}
          style={{
            padding: "10px 20px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          🗑️ Clear Draft
        </button>
      </div>

      {lastSaved && (
        <p style={{ marginTop: "10px", color: "#4CAF50", fontWeight: "bold" }}>
          ✓ Saved at {lastSaved}
        </p>
      )}

      {draftText.trim() && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            backgroundColor: "#f0f0f0",
            borderRadius: "4px",
          }}
        >
          <strong>Character count:</strong> {draftText.length} |{" "}
          <strong>Word count:</strong> {draftText.split(/\s+/).filter(Boolean).length}
        </div>
      )}

      <div style={{ marginTop: "15px", fontSize: "12px", color: "#666" }}>
        <p>💡 Auto-saves every 30 seconds when you have text in the draft.</p>
        <p>
          📱 Your drafts are stored locally on this device and persist across
          sessions.
        </p>
      </div>
    </div>
  );
}
