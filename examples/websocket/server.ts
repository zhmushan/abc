import { Application } from "../../mod.ts";
import { HandlerFunc } from "../../types.ts";
import { acceptWebSocket } from "https://deno.land/std@0.51.0/ws/mod.ts";

const app = new Application();

const hello: HandlerFunc = async (c) => {
  const { conn, headers, r: bufReader, w: bufWriter } = c.request;
  const ws = await acceptWebSocket({
    conn,
    headers,
    bufReader,
    bufWriter,
  });

  for await (const e of ws) {
    console.log(e);
    await ws.send("Hello, Client!");
  }
};

app.get("/ws", hello).file("/", "./index.html").start({ port: 8080 });

console.log(`server listening on http://localhost:8080`);
