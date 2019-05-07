const times = 5000;
export const routes = [];

function randomStr() {
  return (Math.random() * +new Date()).toString(36).replace(".", "");
}

for (let i = 0; i < times; ++i) {
  const slash = Math.random() * 100;
  let path = "";
  for (let j = 0; j < slash; ++j) {
    path += `/${randomStr()}`;
  }
  routes.push(path);
}

Deno.writeFile(
  "db.json",
  new TextEncoder().encode(`["${routes.join('","')}"]`)
);
