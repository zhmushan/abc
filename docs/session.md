## Session

Serverside sessions are used to store values across multiple requests without the end-user accessing it.

### Usage

```ts
import { Application } from "https://deno.land/x/abc@v1.0.2/mod.ts";
import { session } from "https://deno.land/x/abc@v1/middleware/session.ts";

const app = new Application();
app.use(session());
```

### Default Configuration

```ts
export const DefaultSessionConfig: SessionConfig = {
    key: "abc.session",
    skipper: DefaultSkipper,
};
```
