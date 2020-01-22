import { Cat } from "./cat.ts";
import { Context } from "../../mod.ts";

let catId = 1;
const cats = [] as Cat[];

export function findAll(): Cat[] {
  return cats;
}

export function findOne(c: Context): Cat {
  const { id } = c.params as { id: string };
  return cats.find((cat: Cat): string => cat.id.toString() === id);
}

export async function create(c: Context): Promise<Cat> {
  const cat = await c.bind(Cat);
  cat.id = catId++;
  cats.push(cat);
  return cat;
}
