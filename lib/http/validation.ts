import { z } from "zod";
import { AppError } from "./errors";

type ParseOptions = {
  code?: string;
  message?: string;
  allowEmpty?: boolean;
  emptyValue?: unknown;
};

export const parseBody = async <T>(
  request: Request,
  schema: z.ZodSchema<T>,
  options: ParseOptions = {},
): Promise<T> => {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    if (options.allowEmpty) {
      json = options.emptyValue ?? {};
    } else {
      throw new AppError(
        options.code ?? "VALIDATION_ERROR",
        options.message ?? "invalid json",
        400,
        { reason: "invalid_json" },
      );
    }
  }

  const result = schema.safeParse(json);
  if (!result.success) {
    const firstMessage = result.error.issues[0]?.message;
    throw new AppError(
      options.code ?? "VALIDATION_ERROR",
      options.message ?? firstMessage ?? "invalid input",
      400,
      { issues: result.error.issues },
    );
  }
  return result.data;
};
