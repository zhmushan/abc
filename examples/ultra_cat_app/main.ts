import { Application, path } from "./deps.ts";
import userGroup from "./user/group.ts";
import catGroup from "./cat/group.ts";
import { jsxLoader } from "./jsx_loader.ts";

const app = new Application();
app.start({ port: 8080 });

const staticRoot = "./public";

app
  .get("/", (c) => c.file("./public/index.html"))
  .static("/", staticRoot, jsxLoader, (n) =>
    (c) => {
      c.set("realpath", path.join(staticRoot, c.path));
      return n(c);
    });

userGroup(app.group("/user"));
catGroup(app.group("/cat"));

console.log(`server listening on http://localhost:8080`);
