import type { Group } from "../deps.ts";
import type { User } from "./user.ts";

import { Md5 } from "../deps.ts";
import DB from "../db.ts";

export default function (g: Group) {
  g.post("/login", async (c) => {
    let { username, password } = await c.body as User;
    if (username && password) {
      const user = ((await DB.query(
        `SELECT password FROM users WHERE username = ?`,
        [username],
      )) as { password: string }[])[0];
      if (user.password === new Md5().update(password).toString()) {
        return { username };
      }
    }
  }).post("/signup", async (c) => {
    let { username, password } = await c.body as User;
    if (username && password) {
      const user = await DB.transaction(async (conn) => {
        await conn.execute(
          `INSERT INTO users(username, password) VALUES(?, ?)`,
          [username, new Md5().update(password!).toString()],
        );
        const result = (await conn.query(
          `SELECT username FROM users WHERE username = ?`,
          [username],
        )) as { username: string }[];

        return result[0];
      }).catch((e) => {
        console.log(e);
      });

      return user;
    }
  });
}
