import { subscribeTaskUpdates } from "@/lib/task-events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const encoder = new TextEncoder();
const HEARTBEAT_INTERVAL_IN_MS = 25000;
const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
} as const;

const formatEvent = (
  event: string,
  payload: Record<string, number | string>,
) => {
  return `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
};

export async function GET(request: Request) {
  const stream = new ReadableStream({
    start(controller) {
      let isConnectionClosed = false;

      const sendEvent = (
        event: string,
        payload: Record<string, number | string>,
      ) => {
        if (isConnectionClosed) {
          return;
        }

        controller.enqueue(encoder.encode(formatEvent(event, payload)));
      };

      sendEvent("connected", { timestamp: Date.now() });

      const unsubscribe = subscribeTaskUpdates(() => {
        sendEvent("tasks-updated", { timestamp: Date.now() });
      });

      const heartbeat = setInterval(() => {
        sendEvent("ping", { timestamp: Date.now() });
      }, HEARTBEAT_INTERVAL_IN_MS);

      const closeConnection = () => {
        if (isConnectionClosed) {
          return;
        }

        isConnectionClosed = true;
        clearInterval(heartbeat);
        unsubscribe();
        request.signal.removeEventListener("abort", closeConnection);
        controller.close();
      };

      request.signal.addEventListener("abort", closeConnection);
    },
  });

  return new Response(stream, {
    headers: SSE_HEADERS,
  });
}
