import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import App from "./App";
import { Landing } from "./pages/Landing";
import "./index.css";

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL as string | undefined;

function ConfigMissing() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060908] px-6 text-center">
      <div className="max-w-md">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
          <span className="font-mono text-lg">⌁</span>
        </div>
        <h1 className="text-xl font-bold text-white">
          Hookline is built, but not connected yet.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-400">
          This build was produced without a Convex backend URL. Set{" "}
          <code className="rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-xs text-emerald-300">
            VITE_CONVEX_URL
          </code>{" "}
          and{" "}
          <code className="rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-xs text-emerald-300">
            VITE_CONVEX_SITE_URL
          </code>{" "}
          as production env vars (from your Convex cloud project), then
          redeploy.
        </p>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);

if (!CONVEX_URL) {
  // Backend not configured: the landing page still works, but auth and the
  // dashboard need a Convex URL, so they show a clear config screen.
  root.render(
    <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="*" element={<ConfigMissing />} />
        </Routes>
      </BrowserRouter>
    </StrictMode>,
  );
} else {
  const convex = new ConvexReactClient(CONVEX_URL);
  root.render(
    <StrictMode>
      <BrowserRouter>
        <ConvexAuthProvider client={convex}>
          <App />
        </ConvexAuthProvider>
      </BrowserRouter>
    </StrictMode>,
  );
}
