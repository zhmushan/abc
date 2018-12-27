// Copyright 2018 the Deno authors.
// Based on https://github.com/denoland/deno_std/blob/master/net/file_server.ts
import { readDir, stat, DenoError, ErrorKind, readFile } from "deno";
import { Context } from "context.ts";
import { NotFoundHandler, InternalServerErrorHandler } from "abc.ts";

const dirViewerTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Deno File Server</title>
  <style>
    td {
      padding: 0 1rem;
    }
    td.mode {
      font-family: Courier;
    }
  </style>
</head>
<body>
  <h1>Index of <%DIRNAME%></h1>
  <table>
    <tr><th>Mode</th><th>Size</th><th>Name</th></tr>
    <%CONTENTS%>
  </table>
</body>
</html>
`;

export async function serveDir(dirpath: string, serverpath: string) {
  const listEntry: string[] = [];
  const fileInfos = await readDir(dirpath);
  for (const info of fileInfos) {
    if (info.name === "index.html" && info.isFile()) {
      // in case index.html as dir...
      return serveFile(info.path);
    }
    // Yuck!
    let mode = null;
    try {
      mode = (await stat(info.path)).mode;
    } catch {}
    listEntry.push(
      createDirEntryDisplay(
        info.name,
        serverpath + info.name,
        info.isFile() ? info.len : null,
        mode,
        info.isDirectory()
      )
    );
  }

  const page = dirViewerTemplate
    .replace("<%DIRNAME%>", serverpath)
    .replace("<%CONTENTS%>", listEntry.join(""));

  return page;
}
export async function serveFile(filepath: string) {
  const file = new TextDecoder().decode(await readFile(filepath));
  return file;
}
export async function serveFallback(c: Context, e: Error) {
  if (
    e instanceof DenoError &&
    (e as DenoError<any>).kind === ErrorKind.NotFound
  ) {
    return NotFoundHandler(c);
  } else {
    return InternalServerErrorHandler(c);
  }
}
function createDirEntryDisplay(
  name: string,
  path: string,
  size: number | null,
  mode: number | null,
  isDir: boolean
) {
  const sizeStr = size === null ? "" : "" + fileLenToString(size!);
  return `
  <tr><td class="mode">${modeToString(
    isDir,
    mode
  )}</td><td>${sizeStr}</td><td><a href="${path}${isDir ? "/" : ""}">${name}${
    isDir ? "/" : ""
  }</a></td>
  </tr>
  `;
}
function fileLenToString(len: number) {
  const multipler = 1024;
  let base = 1;
  const suffix = ["B", "K", "M", "G", "T"];
  let suffixIndex = 0;

  while (base * multipler < len) {
    if (suffixIndex >= suffix.length - 1) {
      break;
    }
    base *= multipler;
    suffixIndex++;
  }

  return `${(len / base).toFixed(2)}${suffix[suffixIndex]}`;
}
function modeToString(isDir: boolean, maybeMode: number | null) {
  const modeMap = ["---", "--x", "-w-", "-wx", "r--", "r-x", "rw-", "rwx"];

  if (maybeMode === null) {
    return "(unknown mode)";
  }
  const mode = maybeMode!.toString(8);
  if (mode.length < 3) {
    return "(unknown mode)";
  }
  let output = "";
  mode
    .split("")
    .reverse()
    .slice(0, 3)
    .forEach(v => {
      output = modeMap[+v] + output;
    });
  output = `(${isDir ? "d" : "-"}${output})`;
  return output;
}
