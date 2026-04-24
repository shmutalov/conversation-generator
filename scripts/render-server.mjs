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
const webDist = path.resolve(projectRoot, "web-dist");

const PORT = Number(process.env.PORT ?? 3838);
const HOST = process.env.HOST ?? "0.0.0.0";

console.log("Bundling Remotion composition…");
const serveUrl = await bundle({ entryPoint });
console.log("Bundle ready.");

const app = express();
app.use(express.json({ limit: "2mb" }));

app.get("/status", (_req, res) => {
  res.json({ ok: true });
});

const webDistExists = await fs
  .stat(webDist)
  .then((s) => s.isDirectory())
  .catch(() => false);
if (webDistExists) {
  app.use(express.static(webDist, { index: "index.html", extensions: ["html"] }));
}

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

const jobs = new Map();
const JOB_TTL_MS = Number(process.env.JOB_TTL_MS ?? 60 * 60 * 1000);

function broadcast(job, event) {
  job.lastEvent = event;
  for (const subscriber of job.subscribers) {
    subscriber(event);
  }
}

function scheduleCleanup(job) {
  if (job.cleanupTimer) return;
  job.cleanupTimer = setTimeout(() => {
    fs.unlink(job.tempFile).catch(() => {});
    jobs.delete(job.id);
  }, JOB_TTL_MS);
}

const browserExecutable = process.env.CHROMIUM_PATH || undefined;

async function runRenderJob(job, props) {
  try {
    broadcast(job, { kind: "state", state: "selecting" });
    const composition = await selectComposition({
      serveUrl,
      id: "Conversation",
      inputProps: props,
      browserExecutable,
    });

    broadcast(job, { kind: "state", state: "rendering" });
    await renderMedia({
      composition,
      serveUrl,
      codec: "h264",
      outputLocation: job.tempFile,
      inputProps: props,
      browserExecutable,
      onProgress: ({ progress }) => {
        job.progress = progress;
        broadcast(job, { kind: "progress", progress });
      },
    });

    const stat = await fs.stat(job.tempFile);
    job.state = "done";
    job.bytes = stat.size;
    broadcast(job, {
      kind: "done",
      url: `/render/${job.id}/file`,
      bytes: stat.size,
    });
    scheduleCleanup(job);
  } catch (err) {
    job.state = "error";
    job.error = err instanceof Error ? err.message : String(err);
    broadcast(job, { kind: "error", message: job.error });
    console.error(`Render ${job.id} failed:`, err);
    scheduleCleanup(job);
  }
}

app.post("/render", (req, res) => {
  if (!looksLikeDialogue(req.body)) {
    res
      .status(400)
      .type("text")
      .send("Body must be a dialogue object with template/resolution/aspect/messages");
    return;
  }

  const jobId = crypto.randomBytes(8).toString("hex");
  const job = {
    id: jobId,
    template: req.body.template,
    state: "pending",
    progress: 0,
    tempFile: path.join(os.tmpdir(), `convgen-${jobId}.mp4`),
    subscribers: new Set(),
    lastEvent: null,
    bytes: 0,
    error: null,
  };
  jobs.set(jobId, job);

  res.json({ jobId });

  runRenderJob(job, req.body).catch((err) => {
    console.error("runRenderJob crash:", err);
  });
});

app.get("/render/:jobId/events", (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) {
    res.status(404).type("text").send("Unknown job");
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  const send = (event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
    if (event.kind === "done" || event.kind === "error") {
      job.subscribers.delete(send);
      res.end();
    }
  };

  job.subscribers.add(send);

  if (job.lastEvent) {
    send(job.lastEvent);
  } else {
    send({ kind: "state", state: job.state });
  }

  req.on("close", () => {
    job.subscribers.delete(send);
  });
});

app.get("/render/:jobId/file", async (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) {
    res.status(404).type("text").send("Unknown job");
    return;
  }
  if (job.state !== "done") {
    res.status(409).type("text").send(`Job not ready (state=${job.state})`);
    return;
  }

  try {
    const data = await fs.readFile(job.tempFile);
    res.setHeader("content-type", "video/mp4");
    res.setHeader(
      "content-disposition",
      `attachment; filename="${job.template}-${Date.now()}.mp4"`,
    );
    res.end(data);
  } catch (err) {
    res.status(500).type("text").send(err instanceof Error ? err.message : String(err));
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Render server listening on http://${HOST}:${PORT}`);
});
