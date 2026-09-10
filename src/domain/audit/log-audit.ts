import { AuditLogRepository, type AuditLogInput } from "./audit-log.repository";

/**
 * Best-effort audit logging (blueprint §32). A failed audit write must never
 * roll back or block the primary mutation — the same best-effort rule the
 * blueprint applies to notifications (§29). Failures are surfaced server-side
 * only, so the caller can still report a successful result.
 */
export async function logAudit(input: AuditLogInput): Promise<void> {
  try {
    await new AuditLogRepository().create(input);
  } catch (error) {
    console.error("[audit] failed to record", input.entityType, error);
  }
}
