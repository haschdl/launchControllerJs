export var PAD_MODE = Object.freeze({
   /**
    * Pad works like a on/off switch. The state of the pad is persisted, and pad is lit
    * until a second push. Several pads can be turned on at the same time.
    * This is the default mode. Note: the state of each pad is available from
    * {@link LaunchController#getPad(PADS)}.
    */
   TOGGLE: 1,
   /**
    * Pads work as a group of "radio buttons", meaning that only one pad can be activated at a time.
    * Pushing one pad will deactivate the other pads.
    */
   RADIO: 2
});

export class Pad {
   constructor(name, code, mode) {
      this.name = name;
      this.code = code;
      this.status = false;
   }
}

export class PadSet {

   constructor(padCount, padMode) {
      this.padCount = padCount;
      this.padMode = padMode;

      //initialize the pad array with False => all pads are off
      this.padStatus = new Array(padCount); //Array.apply(null, new Array(padCount)).map(function(){return false});


      for (let i = 0; i < padCount; i++) {
         this[i] = new Pad("PAD_" + i, i);

      }
   }

   get length() {
      return this.padCount;
   }
   getPad(padIndex) {
      return this[padIndex];
   }

   get firstSelected() {
      for (let i = 0; i < this.padCount; i++) {
         if (this[i].status == true)
            return this[i].code;
      }
   }
}