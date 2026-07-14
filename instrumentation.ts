import { logEvent } from "@/lib/observability";

export function register() {}

export function onRequestError(
  error: unknown,
  request: { path: string; method: string },
  context: { routePath: string; routeType: string; renderSource: string },
) {
  logEvent("error", "request.unhandled_error", {
    path: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
    renderSource: context.renderSource,
    error: error instanceof Error ? error.message : "Unknown request error",
  });
}
