type LogMeta = Record<string, unknown>;

function ts() {
  return new Date().toISOString();
}

export const logger = {
  info(action: string, meta: LogMeta = {}) {
    console.log(JSON.stringify({ level: "info", ts: ts(), action, ...meta }));
  },
  warn(action: string, meta: LogMeta = {}) {
    console.warn(JSON.stringify({ level: "warn", ts: ts(), action, ...meta }));
  },
  error(action: string, meta: LogMeta = {}) {
    console.error(JSON.stringify({ level: "error", ts: ts(), action, ...meta }));
  },
  async audit(actorId: string | null, action: string, entity: string, entityId?: string, metadata: LogMeta = {}) {
    try {
      await import("./prisma").then(({ prisma }) =>
        prisma.auditLog.create({
          data: { actorId, action, entity, entityId, metadata: metadata as any },
        })
      );
    } catch {
      // non-critical
    }
    console.log(JSON.stringify({ level: "audit", ts: ts(), actorId, action, entity, entityId, ...metadata }));
  },
};
