const activeConnections = new Map<string, ReadableStreamDefaultController>();

export function registerConnection(userId: string, controller: ReadableStreamDefaultController) {
  activeConnections.set(userId, controller);
}

export function unregisterConnection(userId: string) {
  activeConnections.delete(userId);
}

export function pushToConnection(userId: string, data: unknown): boolean {
  const controller = activeConnections.get(userId);
  if (!controller) return false;
  try {
    const encoder = new TextEncoder();
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    return true;
  } catch {
    activeConnections.delete(userId);
    return false;
  }
}
