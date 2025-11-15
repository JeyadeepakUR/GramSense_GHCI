import { useRef, useState } from "react";
import {
  processAudio,
  detectVoiceActivity,
  saveOffline,
  enqueue,
} from "@core";

interface VADResult {
  startMs: number;
  endMs: number;
  confidence: number;
}

interface AudioAnalysis {
  durationMs: number;
  segments: VADResult[];
  audioKey: string;
}

export interface AudioRecorderProps {
  onAnalysisComplete?: (analysis: AudioAnalysis) => void;
}

export default function AudioRecorder({ onAnalysisComplete }: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Start recording
  const startRecording = async () => {
    try {
      setStatus("🎤 Recording...");
      setIsProcessing(false);

      // Ask for microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create MediaRecorder
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];

      // Collect recorded chunks
      recorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      // Start
      recorder.start();
      setRecording(true);
    } catch (err) {
      setStatus("❌ Microphone blocked or unavailable");
      console.error("Recording error:", err);
    }
  };

  // Stop recording and process audio
  const stopRecording = async () => {
    setRecording(false);
    setIsProcessing(true);

    recorderRef.current!.onstop = async () => {
      try {
        setStatus("⏳ Processing audio...");

        // Combine chunks to final audio blob
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });

        // Convert blob to ArrayBuffer for processing
        const arrayBuffer = await audioBlob.arrayBuffer();

        // Step 1: Process raw audio using core API
        const processed = await processAudio(arrayBuffer, 16000);
        console.log(`✓ Processed ${processed.durationMs}ms of audio`);

        // Step 2: Detect voice activity using core API
        const segments = detectVoiceActivity(processed.frames, processed.sampleRate);
        console.log(`✓ Found ${segments.length} speech segments`);

        // Save audio metadata offline
        const audioKey = `audio_${Date.now()}`;
        await saveOffline(audioKey, {
          key: audioKey,
          createdAt: Date.now(),
          durationMs: processed.durationMs,
          segmentCount: segments.length,
          blob: audioBlob,
        });

        // Queue for background sync
        enqueue(
          {
            type: "audio_analysis",
            audioKey,
            durationMs: processed.durationMs,
            segments,
            timestamp: Date.now(),
          },
          0
        );

        // Notify parent component
        const analysis: AudioAnalysis = {
          durationMs: processed.durationMs,
          segments,
          audioKey,
        };

        if (onAnalysisComplete) {
          onAnalysisComplete(analysis);
        }

        setStatus(`✅ Audio processed! Found ${segments.length} speech segments`);
        setIsProcessing(false);
      } catch (error) {
        setStatus(`❌ Processing failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        setIsProcessing(false);
        console.error("Processing error:", error);
      }
    };

    recorderRef.current!.stop();
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h3>🎙️ Audio Recorder</h3>
      <button
        onClick={recording ? stopRecording : startRecording}
        disabled={isProcessing}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: isProcessing ? "not-allowed" : "pointer",
          opacity: isProcessing ? 0.6 : 1,
        }}
      >
        {isProcessing ? "Processing..." : recording ? "⏹ Stop" : "▶ Record"}
      </button>
      <p style={{ marginTop: "10px", color: recording ? "#ff6b6b" : "#228be6" }}>
        {status}
      </p>
    </div>
  );
}
