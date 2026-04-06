import { subscribeUser } from "@/lib/server/notificationsHub";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const userId = req.nextUrl.searchParams.get("userId");

  if (!userId) {
    return new Response("Missing userId", { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (payload) => {
        controller.enqueue(
          encoder.encode(
            `event: status-update\ndata: ${JSON.stringify(payload)}\n\n`,
          ),
        );
      };

      controller.enqueue(
        encoder.encode(
          `event: connected\ndata: ${JSON.stringify({ userId, connectedAt: Date.now() })}\n\n`,
        ),
      );

      const unsubscribe = subscribeUser(String(userId), sendEvent);

      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(`: ping ${Date.now()}\n\n`));
      }, 20000);

      const onAbort = () => {
        clearInterval(keepAlive);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // ignore close race
        }
      };

      req.signal.addEventListener("abort", onAbort);
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
