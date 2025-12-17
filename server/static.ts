import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "../dist/public"); // Fixed: resolve dist/public correctly
  if (!fs.existsSync(path.join(distPath, "index.html"))) {
    throw new Error(
      `Could not find index.html in: ${distPath}. Make sure to build the client first.`
    );
  }

  // Serve all static files in the dist/public directory
  app.use(express.static(distPath));

  // Forward all other requests to index.html (for SPA routing support)
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
