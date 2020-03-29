// TODO: waiting for denoland/deno#4297
// import type { HandlerFunc } from "../../mod.ts";

import { HandlerFunc } from "../../mod.ts";

import { Cat } from "./cat.ts";

const cats: Cat[] = [];

export const findAll: HandlerFunc = () => cats;
export const findOne: HandlerFunc = (c) => {
  const { id } = c.params as { id: string };
  return cats.find((cat) => cat.id.toString() === id);
};
export const create: HandlerFunc = async (c) => {
  const { name, age } = (await c.body()) as {
    name: string;
    age: number;
  };
  const cat = new Cat({ name, age });
  cats.push(cat);
  return cat;
};
