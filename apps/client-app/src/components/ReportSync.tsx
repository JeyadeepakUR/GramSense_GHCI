import { useState, useEffect } from "react";
import { enqueue, flush } from "@core";

interface QueuedItem {
  id: string;
  type: string;
  timestamp: number;
  attempts: number;
}

export interface ReportSyncProps {
  enabled?: boolean;
  syncIntervalMs?: number;
  onSync?: (processedCount: number) => void;
}

export default function ReportSync({
  enabled = true,
  syncIntervalMs = 30000,
  onSync,
}: ReportSyncProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>("");
  const [queuedItems, setQueuedItems] = useState<QueuedItem[]>([]);
  const [totalSynced, setTotalSynced] = useState(0);

  // Manual sync function
  const performSync = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    setSyncStatus("⏳ Syncing...");

    try {
      const result = await flush(async (payload: any) => {
        // Simulate API call to backend
        console.log("Syncing payload:", payload);

        // In real implementation, this would be:
        // await fetch("/api/sync", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(payload)
        // });

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        console.log("✓ Payload synced successfully");
      });

      const synced = result.processed;
      setTotalSynced((prev) => prev + synced);

      const now = new Date().toLocaleTimeString();
      setLastSyncTime(now);

      if (synced > 0) {
        setSyncStatus(`✅ Synced ${synced} item(s) at ${now}`);
      } else {
        setSyncStatus("✓ Queue is empty");
      }

      if (onSync) {
        onSync(synced);
      }

      console.log(`✓ Sync complete: ${synced} items processed`);
    } catch (error) {
      setSyncStatus(
        `❌ Sync failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      console.error("Sync error:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Queue a report for syncing
  const queueReport = (reportData: any) => {
    try {
      const item = enqueue(reportData, 0);

      setQueuedItems((prev) => [
        ...prev,
        {
          id: item.id,
          type: reportData.type || "report",
          timestamp: Date.now(),
          attempts: 0,
        },
      ]);

      setSyncStatus(`📌 Report queued (ID: ${item.id.slice(0, 8)}...)`);
      console.log("Report queued:", item);
    } catch (error) {
      setSyncStatus(`❌ Failed to queue: ${error}`);
      console.error("Queue error:", error);
    }
  };

  // Set up periodic sync
  useEffect(() => {
    if (!enabled) return;

    const syncInterval = setInterval(() => {
      performSync();
    }, syncIntervalMs);

    return () => clearInterval(syncInterval);
  }, [enabled, syncIntervalMs]);

  // Submit sample report
  const submitSampleReport = () => {
    const sampleReport = {
      type: "sample_report",
      content: `Sample report generated at ${new Date().toISOString()}`,
      region: "Region-A",
      timestamp: Date.now(),
    };

    queueReport(sampleReport);
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h3>🔄 Report Sync & Queue Manager</h3>

      {/* Queue Status */}
      <div
        style={{
          padding: "15px",
          backgroundColor: "#f9f9f9",
          borderRadius: "4px",
          marginBottom: "15px",
        }}
      >
        <p>
          <strong>📊 Queue Status:</strong> {queuedItems.length} item(s) queued
        </p>
        <p>
          <strong>✅ Total Synced:</strong> {totalSynced} item(s)
        </p>
        {lastSyncTime && (
          <p>
            <strong>⏰ Last Sync:</strong> {lastSyncTime}
          </p>
        )}
      </div>

      {/* Sync Status Message */}
      {syncStatus && (
        <div
          style={{
            padding: "10px",
            backgroundColor:
              syncStatus.includes("✅") || syncStatus.includes("✓")
                ? "#e8f5e9"
                : syncStatus.includes("❌")
                  ? "#ffebee"
                  : "#e3f2fd",
            borderRadius: "4px",
            marginBottom: "15px",
            color:
              syncStatus.includes("✅") || syncStatus.includes("✓")
                ? "#2e7d32"
                : syncStatus.includes("❌")
                  ? "#c62828"
                  : "#1565c0",
            fontWeight: "bold",
          }}
        >
          {syncStatus}
        </div>
      )}

      {/* Control Buttons */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <button
          onClick={performSync}
          disabled={isSyncing || queuedItems.length === 0}
          style={{
            padding: "10px 20px",
            backgroundColor: isSyncing ? "#cccccc" : "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isSyncing ? "not-allowed" : "pointer",
            opacity: isSyncing || queuedItems.length === 0 ? 0.6 : 1,
          }}
        >
          {isSyncing ? "🔄 Syncing..." : "🚀 Sync Now"}
        </button>

        <button
          onClick={submitSampleReport}
          disabled={isSyncing}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isSyncing ? "not-allowed" : "pointer",
            opacity: isSyncing ? 0.6 : 1,
          }}
        >
          ➕ Queue Sample Report
        </button>
      </div>

      {/* Auto-Sync Toggle Info */}
      <div
        style={{
          padding: "10px",
          backgroundColor: "#e3f2fd",
          borderRadius: "4px",
          fontSize: "12px",
          color: "#1565c0",
        }}
      >
        <p>
          🔄 <strong>Auto-sync enabled:</strong> Queue flushes every{" "}
          {syncIntervalMs / 1000} seconds
        </p>
        <p>
          📌 <strong>How it works:</strong> Items are queued, then synced in the
          background with automatic retry on failure
        </p>
      </div>

      {/* Queued Items List */}
      {queuedItems.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h4>📋 Queued Items:</h4>
          <div
            style={{
              maxHeight: "200px",
              overflowY: "auto",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          >
            {queuedItems.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  padding: "10px",
                  borderBottom: idx < queuedItems.length - 1 ? "1px solid #eee" : "none",
                  backgroundColor: idx % 2 === 0 ? "#fafafa" : "white",
                }}
              >
                <div>
                  <strong>#{idx + 1}</strong> | Type: <code>{item.type}</code>
                </div>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  ID: {item.id.slice(0, 12)}... | Queued:{" "}
                  {new Date(item.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
