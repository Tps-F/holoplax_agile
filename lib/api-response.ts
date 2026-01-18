import { NextResponse } from "next/server";
import { AuthError } from "./api-auth";

type ErrorEnvelope = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

const buildEnvelope = (code: string, message: string, details?: unknown): ErrorEnvelope => {
  if (details === undefined) {
    return { error: { code, message } };
  }
  return { error: { code, message, details } };
};

const errorResponse = (
  code: string,
  message: string,
  status: number,
  details?: unknown,
) => NextResponse.json(buildEnvelope(code, message, details), { status });

export const ok = (data: unknown, init?: ResponseInit) =>
  NextResponse.json(data, init);

export const badRequest = (message: string, code = "BAD_REQUEST", details?: unknown) =>
  errorResponse(code, message, 400, details);

export const unauthorized = (code = "UNAUTHORIZED", details?: unknown) =>
  errorResponse(code, "unauthorized", 401, details);

export const unauthorizedWithMessage = (
  message: string,
  code = "UNAUTHORIZED",
  details?: unknown,
) => errorResponse(code, message, 401, details);

export const forbidden = (code = "FORBIDDEN", details?: unknown) =>
  errorResponse(code, "forbidden", 403, details);

export const notFound = (message = "not found", code = "NOT_FOUND", details?: unknown) =>
  errorResponse(code, message, 404, details);

export const conflict = (message: string, code = "CONFLICT", details?: unknown) =>
  errorResponse(code, message, 409, details);

export const serverError = (message: string, code = "INTERNAL_ERROR", details?: unknown) =>
  errorResponse(code, message, 500, details);

export const handleAuthError = (error: unknown) =>
  error instanceof AuthError
    ? unauthorizedWithMessage(error.message || "unauthorized", "AUTH_UNAUTHORIZED")
    : null;
