import { subscribeTaskUpdates } from "@/lib/task-events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const encoder = new TextEncoder();

const formatEvent = (
  event: string,
  payload: Record<string, number | string>,
) => {
  return `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
};

export async function GET(request: Request) {
  const stream = new ReadableStream({
    start(controller) {
      const send = (
        event: string,
        payload: Record<string, number | string>,
      ) => {
        controller.enqueue(encoder.encode(formatEvent(event, payload)));
      };

      send("connected", { timestamp: Date.now() });

      const unsubscribe = subscribeTaskUpdates(() => {
        send("tasks-updated", { timestamp: Date.now() });
      });

      const heartbeat = setInterval(() => {
        send("ping", { timestamp: Date.now() });
      }, 25000);

      const closeConnection = () => {
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
      };

      request.signal.addEventListener("abort", closeConnection);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
