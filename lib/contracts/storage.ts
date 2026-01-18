import { z } from "zod";

const toStringOrEmpty = (value: unknown) => (value == null ? "" : String(value));
const nonEmptyString = (message: string) =>
  z.preprocess(toStringOrEmpty, z.string().trim().min(1, message));

export const AvatarUploadSchema = z
  .object({
    filename: nonEmptyString("filename is required"),
    contentType: nonEmptyString("contentType is required"),
  })
  .passthrough();
