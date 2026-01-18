import { z } from "zod";

const toStringOrEmpty = (value: unknown) => (value == null ? "" : String(value));

export const DiscordCreateTaskSchema = z
  .object({
    title: z.preprocess(toStringOrEmpty, z.string().trim()).optional(),
    content: z.preprocess(toStringOrEmpty, z.string().trim()).optional(),
    description: z.preprocess(toStringOrEmpty, z.string().trim()).optional(),
    points: z.coerce.number().optional(),
    urgency: z.preprocess(toStringOrEmpty, z.string().trim()).optional(),
    risk: z.preprocess(toStringOrEmpty, z.string().trim()).optional(),
  })
  .passthrough();
