import express from "express";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs/promises";
import os from "node:os";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const entryPoint = path.resolve(projectRoot, "src/index.ts");

const PORT = Number(process.env.PORT ?? 3838);

console.log("Bundling Remotion composition…");
const serveUrl = await bundle({ entryPoint });
console.log("Bundle ready.");

const app = express();
app.use(express.json({ limit: "2mb" }));

app.get("/status", (_req, res) => {
  res.json({ ok: true });
});

function looksLikeDialogue(b) {
  return (
    b &&
    typeof b === "object" &&
    typeof b.template === "string" &&
    typeof b.resolution === "string" &&
    typeof b.aspect === "string" &&
    Array.isArray(b.messages)
  );
}

app.post("/render", async (req, res) => {
  if (!looksLikeDialogue(req.body)) {
    res.status(400).type("text").send("Body must be a dialogue object with template/resolution/aspect/messages");
    return;
  }

  const props = req.body;
  const tempFile = path.join(
    os.tmpdir(),
    `convgen-${crypto.randomBytes(6).toString("hex")}.mp4`,
  );

  try {
    const composition = await selectComposition({
      serveUrl,
      id: "Conversation",
      inputProps: props,
    });

    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      outputLocation: tempFile,
      inputProps: props,
      onProgress: ({ progress }) => {
        if (process.stdout.isTTY) {
          process.stdout.write(`\rRendering ${(progress * 100).toFixed(0)}%   `);
        }
      },
    });
    if (process.stdout.isTTY) process.stdout.write("\n");

    res.setHeader("content-type", "video/mp4");
    res.setHeader(
      "content-disposition",
      `attachment; filename="${props.template}-${Date.now()}.mp4"`,
    );
    const data = await fs.readFile(tempFile);
    res.end(data);
  } catch (err) {
    console.error("Render failed:", err);
    if (!res.headersSent) {
      res.status(500).type("text").send(err instanceof Error ? err.message : String(err));
    }
  } finally {
    fs.unlink(tempFile).catch(() => {});
  }
});

app.listen(PORT, () => {
  console.log(`Render server listening on http://localhost:${PORT}`);
});
