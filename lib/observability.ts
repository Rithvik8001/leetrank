type LogLevel = "info" | "warn" | "error";
type LogFields = Record<string, string | number | boolean | null | undefined>;

const SECRET_FIELD = /(email|token|secret|password|code|invite|evidence|authorization)/i;

export function sanitizeLogFields(fields: LogFields = {}): LogFields {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [
      key,
      SECRET_FIELD.test(key) ? "[redacted]" : typeof value === "string" ? value.slice(0, 240) : value,
    ]),
  );
}

export function logEvent(level: LogLevel, event: string, fields: LogFields = {}) {
  const payload = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...sanitizeLogFields(fields),
  });
  if (level === "error") console.error(payload);
  else if (level === "warn") console.warn(payload);
  else console.info(payload);
}
