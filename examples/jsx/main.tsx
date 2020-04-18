/// <reference path="https://deno.land/x/types/react/v16.13.1/react.d.ts" />

import React from "https://dev.jspm.io/react";
import ReactDOMServer from "https://dev.jspm.io/react-dom/server";
import { Application } from "../../mod.ts";

const app = new Application();

app.use((next) =>
  (c) => {
    let e = next(c);
    if (React.isValidElement(e)) {
      e = ReactDOMServer.renderToString(e);
    }

    return e;
  }
);

app.get("/", () => {
  return <h1>Hello</h1>;
})
  .start({ port: 8080 });

console.log(`server listening on http://localhost:8080`);
