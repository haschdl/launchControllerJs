export class Knob {
   constructor(knobCode, minValue, maxValue) {
      this.min_value = minValue;
      this.max_value = maxValue;
      this.value = 0;
   }

   range(minValue, maxValue) {

      return this;
   }


   get knobValueNormal() {
      let input = 0;
      if (this.hasDefault)
         input = this.defaultValue;
      else
         input = this.value;

      return (input - this.min_value) / (this.max_value - this.min_value);

   }

   set knobValue(knobValue) {
      this.value = knobValue;
   }

   get knobValue() {
      return this.value;
   }

}