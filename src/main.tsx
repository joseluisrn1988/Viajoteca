import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

try {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (err) {
  console.error("Error al inicializar la app:", err);
  document.body.innerHTML = '<div style="padding:20px;text-align:center;font-family:sans-serif"><h2>⚠️ Error al cargar la aplicación</h2><p>Por favor recarga la página.</p><pre style="background:#f0f0f0;padding:10px;border-radius:8px;font-size:12px;text-align:left">' + String(err) + '</pre></div>';
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
