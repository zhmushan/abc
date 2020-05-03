import { Application } from "../../mod.ts";
import { HandlerFunc } from "../../types.ts";
import { acceptWebSocket } from "https://deno.land/std@v0.42.0/ws/mod.ts";

const app = new Application();

const hello: HandlerFunc = async (c) => {
  const { conn, headers, r, w } = c.request;
  const ws = await acceptWebSocket({
    conn,
    headers,
    bufReader: r,
    bufWriter: w,
  });

  for await (const e of ws.receive()) {
    console.log(e);
    await ws.send("Hello, Client!");
  }
};

app.get("/ws", hello).file("/", "./index.html").start({ port: 8080 });
