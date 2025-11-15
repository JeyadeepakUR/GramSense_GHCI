import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register service worker for PWA capabilities only in production builds.
// During development the service worker can interfere with the dev server
// and cached assets (causing the app to appear not to load in the browser).
if (import.meta.env && import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("✓ Service Worker registered successfully:", registration);

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every 60 seconds
      })
      .catch((err) => {
        console.warn("⚠ Service Worker registration failed:", err);
      });

    // Handle messages from service worker
    navigator.serviceWorker.addEventListener("message", (event) => {
      console.log("Message from Service Worker:", event.data);

      if (event.data.type === "PERFORM_SYNC" || event.data.type === "PERIODIC_SYNC") {
        // Trigger sync in the app
        window.dispatchEvent(
          new CustomEvent("service-worker-sync", {
            detail: event.data,
          })
        );
      }
    });
  });

  // Handle service worker updates
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    console.log("✓ Service Worker controller changed - app updated");
  });
}
