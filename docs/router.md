## Router

The router module based on [zhmushan/router](https://github.com/zhmushan/router).

We will always match according to the rules of **Static > Param > Any**. For static routes, we always match strictly equal strings.

**_Pattern: /\* ,/user/:name, /user/zhmushan_**

|      path       |     route      |
| :-------------: | :------------: |
|    /zhmushan    |      /\*       |
| /users/zhmushan |      /\*       |
| /user/zhmushan  | /user/zhmushan |
|   /user/other   |  /user/:name   |

### Basic route

```ts
import { Application } from "https://denolib.com/zhmushan/abc@v1/mod.ts";

const app = new Application();

app.get("/user/:name", (c) => {
  const { name } = c.params;
  return `Hello ${name}!`;
});
```

### Group route

```ts
// user_group.ts
import type { Group } from "https://denolib.com/zhmushan/abc@v1/mod.ts";

export default function (g: Group) {
  g.get("/:name", (c) => {
    const { name } = c.params;
    return `Hello ${name}!`;
  });
}
```

```ts
import { Application } from "https://denolib.com/zhmushan/abc@v1/mod.ts";
import userGroup from "./user_group.ts";

const app = new Application();

userGroup(app.group("user"));
```
