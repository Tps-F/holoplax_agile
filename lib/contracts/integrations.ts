import { z } from "zod";

const toStringOrEmpty = (value: unknown) =>
  value == null ? "" : String(value);

export const DiscordIntakeSchema = z
  .object({
    title: z.preprocess(toStringOrEmpty, z.string().trim()),
    body: z.preprocess(toStringOrEmpty, z.string().trim()).optional(),
    source: z.preprocess(toStringOrEmpty, z.string().trim()).optional(),
    author: z.preprocess(toStringOrEmpty, z.string().trim()).optional(),
    channel: z.preprocess(toStringOrEmpty, z.string().trim()).optional(),
  })
  .passthrough();

export const DiscordCreateTaskSchema = DiscordIntakeSchema;
