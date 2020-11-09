import { decode, Header, MiddlewareFunc, MIME } from "./deps.ts";
const { transpileOnly, readFile } = Deno;

export const jsxLoader: MiddlewareFunc = (next) =>
  async (c) => {
    const filepath = c.get("realpath") as string | undefined;

    if (filepath && /\.[j|t]sx?$/.test(filepath)) {
      c.response.headers.set(
        Header.ContentType,
        MIME.ApplicationJavaScriptCharsetUTF8,
      );
      const f = await readFile(filepath);
      return (
        await transpileOnly(
          {
            [filepath]: decode(f),
          },
          { jsx: "react" },
        )
      )[filepath].source;
    }

    return next(c);
  };
