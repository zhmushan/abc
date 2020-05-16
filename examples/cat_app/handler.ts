import type { HandlerFunc } from "../../mod.ts";

import { Cat, CatDTO } from "./cat.ts";

const cats: Cat[] = [];

export const findAll: HandlerFunc = () => cats;
export const findOne: HandlerFunc = (c) => {
  const { id } = c.params as { id: string };
  return cats.find((cat) => cat.id.toString() === id);
};
export const create: HandlerFunc = async (c) => {
  const { name, age } = await c.body<CatDTO>();
  const cat = new Cat({ name, age });
  cats.push(cat);
  return cat;
};
