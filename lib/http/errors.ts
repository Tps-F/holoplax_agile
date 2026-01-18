import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ErrorEnvelope = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

type ErrorResult = {
  status: number;
  envelope: ErrorEnvelope;
};

export class AppError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(code: string, message: string, status = 400, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

const buildEnvelope = (code: string, message: string, details?: unknown): ErrorEnvelope => {
  if (details === undefined) {
    return { error: { code, message } };
  }
  return { error: { code, message, details } };
};

export const toErrorResult = (
  error: unknown,
  fallback?: { code?: string; message?: string; status?: number },
): ErrorResult => {
  if (error instanceof AppError) {
    return {
      status: error.status,
      envelope: buildEnvelope(error.code, error.message, error.details),
    };
  }
  if (error instanceof ZodError) {
    return {
      status: 400,
      envelope: buildEnvelope(
        fallback?.code ?? "VALIDATION_ERROR",
        fallback?.message ?? "invalid input",
        { issues: error.issues },
      ),
    };
  }
  return {
    status: fallback?.status ?? 500,
    envelope: buildEnvelope(
      fallback?.code ?? "INTERNAL_ERROR",
      fallback?.message ?? "internal error",
    ),
  };
};

export const errorResponse = (
  error: unknown,
  fallback?: { code?: string; message?: string; status?: number },
) => {
  const { status, envelope } = toErrorResult(error, fallback);
  return NextResponse.json(envelope, { status });
};

export const createDomainErrors = (domain: string) => {
  const code = (suffix: string) => `${domain}_${suffix}`;
  return {
    badRequest: (message: string, details?: unknown) =>
      errorResponse(new AppError(code("BAD_REQUEST"), message, 400, details)),
    unauthorized: (message = "unauthorized", details?: unknown) =>
      errorResponse(new AppError(code("UNAUTHORIZED"), message, 401, details)),
    forbidden: (message = "forbidden", details?: unknown) =>
      errorResponse(new AppError(code("FORBIDDEN"), message, 403, details)),
    notFound: (message = "not found", details?: unknown) =>
      errorResponse(new AppError(code("NOT_FOUND"), message, 404, details)),
    conflict: (message: string, details?: unknown) =>
      errorResponse(new AppError(code("CONFLICT"), message, 409, details)),
    internal: (message = "internal error", details?: unknown) =>
      errorResponse(new AppError(code("INTERNAL"), message, 500, details)),
  };
};
