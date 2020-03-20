let catId = 1;
function genCatId(): number {
  return catId++;
}

export class Cat {
  id: number;
  name: string;
  age: number;
  constructor(cat: CatDTO) {
    this.id = genCatId();
    this.name = cat.name;
    this.age = cat.age;
  }
}

export interface CatDTO {
  name: string;
  age: number;
}
