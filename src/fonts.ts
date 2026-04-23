import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadRoboto } from "@remotion/google-fonts/Roboto";
import { loadFont as loadLora } from "@remotion/google-fonts/Lora";

export const interFamily = loadInter().fontFamily;
export const robotoFamily = loadRoboto().fontFamily;
export const loraFamily = loadLora().fontFamily;

export const sansStack = `${interFamily}, ui-sans-serif, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
export const robotoStack = `${robotoFamily}, "Segoe UI", system-ui, -apple-system, Helvetica, Arial, sans-serif`;
export const serifStack = `${loraFamily}, Georgia, ui-serif, serif`;
