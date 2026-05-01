/**
 * Fire-and-forget audit logger. Never throws — a logging failure must
 * never break the main request that triggered it.
 *
 * @param {object|null} staffPayload  - return value of requireAdmin/requireCashier/requireStaff
 * @param {object}      event         - H3 event (used to extract IP)
 * @param {object}      opts
 * @param {string}      opts.action   - e.g. 'ORDER_STATUS_CHANGED'
 * @param {string}      opts.entity   - 'order' | 'product' | 'user'
 * @param {number}      [opts.entityId]
 * @param {object}      [opts.meta]   - arbitrary detail object
 */
export async function logAudit(staffPayload, event, { action, entity, entityId, meta = {} }) {
  try {
    await prisma.auditLog.create({
      data: {
        userId:    staffPayload?.userId    ?? null,
        userEmail: staffPayload?.email     ?? null,
        userRole:  staffPayload?.role      ?? null,
        action,
        entity,
        entityId:  entityId ?? null,
        meta,
        ip: getRequestIP(event, { xForwardedFor: true }) ?? null,
      },
    })
  } catch {
    // intentionally swallowed
  }
}
