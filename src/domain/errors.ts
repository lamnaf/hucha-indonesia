/**
 * Domain-level error types. Repositories map Prisma errors to these so the
 * API layer never needs to interpret raw Prisma error codes.
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends DomainError {}

export class ConflictError extends DomainError {}

export class UnauthorizedError extends DomainError {}

export class ForbiddenError extends DomainError {}

export interface ErrorHints {
  notFound?: string;
  conflict?: string;
}

export function prismaErrorCode(error: Error): string | undefined {
  const code = (error as Error & { code?: unknown }).code;
  return typeof code === "string" ? code : undefined;
}

/**
 * Maps known Prisma errors to domain errors (P2002 unique conflict,
 * P2025 record not found). Unknown errors pass through unchanged.
 */
export function mapPrismaError(error: unknown, hints: ErrorHints = {}): Error {
  if (error instanceof DomainError) return error;
  if (error instanceof Error) {
    const code = prismaErrorCode(error);
    if (code === "P2002") {
      return new ConflictError(
        hints.conflict ?? "Data sudah ada (terjadi konflik)"
      );
    }
    if (code === "P2025") {
      return new NotFoundError(hints.notFound ?? "Data tidak ditemukan");
    }
    if (code === "P2003") {
      return new ConflictError(
        hints.conflict ?? "Data masih digunakan dan tidak dapat dihapus"
      );
    }
    return error;
  }
  return new DomainError(String(error));
}

/**
 * Runs an operation and rethrows known Prisma errors as domain errors.
 */
export async function runMapped<T>(
  operation: () => Promise<T>,
  hints: ErrorHints = {}
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw mapPrismaError(error, hints);
  }
}
