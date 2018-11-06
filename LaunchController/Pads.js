export class Pad {
   constructor(name, code) {
      this.name = name;
      this.code = code;
   }
}

export function PAD_1() { return new Pad("PAD_1", 0)};
export function PAD_2() { return new Pad("PAD_2", 1)};
export function PAD_3() { return new Pad("PAD_3", 2)};
export function PAD_4() { return new Pad("PAD_4", 3)};
export function PAD_5() { return new Pad("PAD_5", 4)};
export function PAD_6() { return new Pad("PAD_6", 5)};
export function PAD_7() { return new Pad("PAD_7", 6)};
export function PAD_8() { return new Pad("PAD_8", 7)};
