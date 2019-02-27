import {
   Knob
} from './Knob.js';

export class KnobSet {

   constructor(numberOfKnobs) {
      for (let i = 0; i < numberOfKnobs; i++) {
         this[i] = new Knob(i, 0, 127);
      }      
   }
}