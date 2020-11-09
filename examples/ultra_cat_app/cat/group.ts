import type { Group } from "../deps.ts";
import type { Cat } from "./cat.ts";

import DB from "../db.ts";

export default function (g: Group) {
  g.get("", (c) => {
    const cats = DB.query(`select * from cats`);

    return cats;
  })
    .post("", async (c) => {
      const { name, age } = await c.body as Cat;

      if (name && age) {
        const result = await DB.execute(
          `INSERT INTO cats(name, age) VALUES(?, ?)`,
          [name, age],
        );

        if (result.affectedRows === 1) {
          return { id: result.lastInsertId, name, age };
        }
      }
    })
    .delete("/:id", async (c) => {
      const id = Number(c.params.id);

      if (id) {
        const result = await DB.execute(`DELETE FROM cats WHERE id = ?`, [id]);

        return result;
      }
    })
    .put("/:id", async (c) => {
      const id = Number(c.params.id);
      const { name, age } = await c.body as Cat;

      if (id) {
        const result = await DB.execute(
          `UPDATE cats SET name = ?, age = ? where id = ?`,
          [name, age, id],
        );

        return result;
      }
    });
}
