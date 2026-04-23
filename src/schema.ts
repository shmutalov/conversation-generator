import { z } from "zod";

export const templateIdSchema = z.enum([
  "chatgpt",
  "claude",
  "gemini",
  "grok",
  "whatsapp",
  "imessage",
  "telegram",
]);
export type TemplateId = z.infer<typeof templateIdSchema>;

export const resolutionSchema = z.enum(["480p", "720p", "1080p"]);
export type Resolution = z.infer<typeof resolutionSchema>;

export const aspectSchema = z.enum([
  "portrait-9:16",
  "landscape-16:9",
  "square-1:1",
  "landscape-4:3",
]);
export type Aspect = z.infer<typeof aspectSchema>;

export const themeSchema = z.enum(["light", "dark"]);
export type Theme = z.infer<typeof themeSchema>;

export const senderSchema = z.enum(["me", "them"]);
export type Sender = z.infer<typeof senderSchema>;

export const messageSchema = z.object({
  sender: senderSchema,
  text: z.string(),
  thinkingMs: z.number().int().nonnegative().optional(),
  typeSpeedCps: z.number().positive().optional(),
  deliveredInstantly: z.boolean().optional(),
  pauseAfterMs: z.number().int().nonnegative().optional(),
});
export type Message = z.infer<typeof messageSchema>;

export const dialogueSchema = z.object({
  template: templateIdSchema,
  resolution: resolutionSchema,
  aspect: aspectSchema,
  fps: z.number().int().positive().default(30),
  theme: themeSchema.default("dark"),
  contactName: z.string().default("Assistant"),
  userName: z.string().default("You"),
  typeSpeedCps: z.number().positive().default(28),
  thinkingMs: z.number().int().nonnegative().default(1400),
  pauseAfterMs: z.number().int().nonnegative().default(700),
  responderReveal: z.enum(["instant", "teletype"]).default("teletype"),
  presentation: z.enum(["fullscreen", "phone-mockup"]).default("fullscreen"),
  backdrop: z.string().default("gradient"),
  messages: z.array(messageSchema),
});
export type Dialogue = z.infer<typeof dialogueSchema>;

export const RESOLUTION_HEIGHTS: Record<Resolution, number> = {
  "480p": 480,
  "720p": 720,
  "1080p": 1080,
};

export const ASPECT_RATIOS: Record<Aspect, [number, number]> = {
  "portrait-9:16": [9, 16],
  "landscape-16:9": [16, 9],
  "square-1:1": [1, 1],
  "landscape-4:3": [4, 3],
};

export function computeDimensions(
  resolution: Resolution,
  aspect: Aspect,
): { width: number; height: number } {
  const [aw, ah] = ASPECT_RATIOS[aspect];
  const shortSide = RESOLUTION_HEIGHTS[resolution];
  if (aw >= ah) {
    const height = shortSide;
    const width = Math.round((height * aw) / ah / 2) * 2;
    return { width, height };
  }
  const width = shortSide;
  const height = Math.round((width * ah) / aw / 2) * 2;
  return { width, height };
}
