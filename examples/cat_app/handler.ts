import type { HandlerFunc } from "../../mod.ts";
import { CatDTO } from "./cat.ts";

import { Cat } from "./cat.ts";

const cats: Cat[] = [];

export const findAll: HandlerFunc = () => cats;
export const findOne: HandlerFunc = (c) => {
  const { id } = c.params as { id: string };
  return cats.find((cat) => cat.id.toString() === id);
};
export const create: HandlerFunc = async ({ req }) => {
  const { name, age } = await req.json() as CatDTO;
  const cat = new Cat({ name, age });
  cats.push(cat);
  return cat;
};
