import { Application } from "./mod.ts";

const app = new Application()

app.get("/hello", c => {
    return "Hello, abc!";
})

app.post("/hello2", async c => {
    return await c.body()
})

app.start({port: 8080})