import { Cat } from "./cat.ts";
import { Context } from "../../mod.ts";

let catId = 1;
const cats = [] as Cat[];

export function findAll() {
  return cats;
}

export function findOne(c: Context) {
  const { id } = c.params as { id: string };
  return cats.find(cat => cat.id.toString() === id);
}

export async function create(c: Context) {
  const cat = await c.bind(Cat);
  cat.id = catId++;
  cats.push(cat);
  return cat;
}
