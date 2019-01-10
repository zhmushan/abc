import { Cat } from "cat.ts";
import { Context } from "https://deno.land/x/abc/mod.ts";

let catId = 1;
const cats = [] as Cat[];

export async function findAll() {
  return cats;
}

export async function findOne(c: Context) {
  const { id } = c.params as { id: string };
  return cats.find(cat => cat.id.toString() === id);
}

export async function create(c: Context) {
  const cat = new Cat();
  const _ = await c.bind(cat);
  cat.id = catId++;
  cats.push(cat);
  return cat;
}
