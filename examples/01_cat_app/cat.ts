import { Binder } from "../../binder.ts";

@Binder()
export class Cat {
  id: number;
  constructor(public name: string, public age: number) {}
}
