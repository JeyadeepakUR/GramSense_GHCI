/**
 * CLIENT APP INTEGRATION EXAMPLE
 * 
 * This file demonstrates how junior developers working on Module 1 (Client App)
 * should call core functions from their UI components.
 * 
 * ⚠️ This is a REFERENCE EXAMPLE ONLY - not part of the actual application.
 * 
 * Location: You work in apps/client-app/src/
 * You import from: "../core"
 */

import React, { useState, useEffect } from "react";
import {
  processAudio,
  detectVoiceActivity,
  extractEntities,
  saveOffline,
  loadOffline,
  enqueue,
  flush,
} from "../core";

/**
 * EXAMPLE 1: Audio Recording and Processing
 */
function AudioRecorderComponent() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");

  const handleAudioCapture = async (audioBuffer) => {
    try {
      // Step 1: Process raw audio
      const processed = await processAudio(audioBuffer, 16000);
      console.log(`Processed ${processed.durationMs}ms of audio`);

      // Step 2: Detect voice activity
      const segments = detectVoiceActivity(
        processed.frames,
        processed.sampleRate
      );
      console.log(`Found ${segments.length} speech segments`);

      // Step 3: You would send segments to transcription service here
      // (that logic is also in core, not shown in this example)

      return segments;
    } catch (error) {
      console.error("Audio processing failed:", error);
    }
  };

  return (
    <div>
      <button onClick={() => setIsRecording(!isRecording)}>
        {isRecording ? "Stop" : "Start"} Recording
      </button>
    </div>
  );
}

/**
 * EXAMPLE 2: NLU and Entity Extraction
 */
function TranscriptAnalyzer() {
  const [text, setText] = useState("");
  const [entities, setEntities] = useState(null);

  const analyzeText = () => {
    // Call core NLU function
    const result = extractEntities(text);

    setEntities(result);

    // Display results
    console.log("Intents:", result.intents);
    console.log("Entities:", result.entities);
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to analyze..."
      />
      <button onClick={analyzeText}>Analyze</button>

      {entities && (
        <div>
          <h3>Detected Entities:</h3>
          {entities.entities.map((ent, i) => (
            <div key={i}>
              {ent.type}: {ent.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * EXAMPLE 3: Offline Storage
 */
function DraftManager() {
  const [draftText, setDraftText] = useState("");

  // Save draft offline
  const saveDraft = async () => {
    await saveOffline("report_draft", {
      text: draftText,
      timestamp: Date.now(),
    });
    alert("Draft saved offline!");
  };

  // Load draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      const record = await loadOffline("report_draft");
      if (record) {
        setDraftText(record.value.text);
      }
    };
    loadDraft();
  }, []);

  return (
    <div>
      <textarea
        value={draftText}
        onChange={(e) => setDraftText(e.target.value)}
        placeholder="Type your report draft..."
      />
      <button onClick={saveDraft}>Save Draft Offline</button>
    </div>
  );
}

/**
 * EXAMPLE 4: Sync Queue for Background Uploads
 */
function ReportSubmitter() {
  const [reports, setReports] = useState([]);

  // Submit report (queue for sync)
  const submitReport = (reportData) => {
    enqueue(reportData, 0);
    console.log("Report queued for sync");
  };

  // Flush queue periodically (call this every 30 seconds)
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      const result = await flush(async (payload) => {
        // Send to backend API
        await fetch("/api/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      });

      if (result.processed > 0) {
        console.log(`Synced ${result.processed} reports`);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(syncInterval);
  }, []);

  return (
    <div>
      <button onClick={() => submitReport({ text: "New report", id: Date.now() })}>
        Submit Report
      </button>
      <p>Reports will sync automatically in the background</p>
    </div>
  );
}

/**
 * KEY TAKEAWAYS FOR JUNIOR DEVELOPERS:
 * 
 * 1. Always import from "../core" - never implement logic in src/
 * 2. Call core functions with proper types and handle errors
 * 3. Core functions return Promises - use async/await
 * 4. Display results in your UI components
 * 5. Never modify core files - ask owner if you need new functionality
 * 
 * WRONG APPROACH (DON'T DO THIS):
 * 
 * function MyComponent() {
 *   const processMyAudio = (buffer) => {
 *     // ❌ DON'T implement logic in UI
 *     const samples = new Float32Array(buffer);
 *     for (let i = 0; i < samples.length; i++) {
 *       samples[i] = samples[i] / 32768;
 *     }
 *     return samples;
 *   };
 * }
 * 
 * CORRECT APPROACH (DO THIS):
 * 
 * import { processAudio } from "../core";
 * 
 * function MyComponent() {
 *   const handleAudio = async (buffer) => {
 *     const processed = await processAudio(buffer);
 *     // Use processed.frames in UI
 *   };
 * }
 */

export {
  AudioRecorderComponent,
  TranscriptAnalyzer,
  DraftManager,
  ReportSubmitter,
};
