var LaunchControllerJS = (function (exports) {
   'use strict';

   function getResetMessage() {
      return Uint8Array.from([184, 0, 0]);
   }

   function getSetTemplateMessage() {
      var template = 0x08;
      return Uint8Array.from([0xF0, 0x00, 0x20, 0x29, 0x02, 0x0A, 0x77, template, 0xF7]);
      
      //      SysexMessage setTemplateMsg = new SysexMessage(msgContent, msgContent.length);
   }

   var LedConstants = (function () {
      function LedConstants() {
      }
      return LedConstants;
   }());
   LedConstants.OFF = 12;
   LedConstants.RED_LOW = 13;
   LedConstants.RED_FULL = 15;
   LedConstants.AMBER_LOW = 29;
   LedConstants.AMBER_FULL = 63;
   LedConstants.YELLOW_FULL = 62;
   LedConstants.GREEN_LOW = 28;
   LedConstants.GREEN_FULL = 60;
   LedConstants["__class"] = "LedConstants";

   var PAD_MODE = Object.freeze({
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

   class Pad {
      constructor(name, code, mode) {
         this.name = name;
         this.code = code;
         this.status = false;
      }
   }

   class PadSet {

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

   class Knob {
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

   class KnobSet {

      constructor(numberOfKnobs) {
         for (let i = 0; i < numberOfKnobs; i++) {
            this[i] = new Knob(i, 0, 127);
         }      
      }
   }

   class LaunchController {
      constructor() {
         this.LaunchControlOut = null;
         this.knobSet = new KnobSet(16);
         this.padSet = new PadSet(8, PAD_MODE.RADIO);
      }

      sendLedOnOff(onOff, pad) {

         //Hex version F0h 00h 20h 29h 02h 0Ah 78h [Template] [LED] Value F7h
         //Where Template is 00h-07h (0-7) for the 8 user templates, and 08h-0Fh (8-15) for the 8 factory
         //templates; LED is the index of the pad/button (00h-07h (0-7) for pads, 08h-0Bh (8-11) for buttons);
         //and Value is the velocity byte that defines the brightness values of both the red and green LEDs.
         let template = 0x08;
         let color = onOff ? LedConstants.RED_FULL : LedConstants.OFF;
         let ledOnMsg = Uint8Array.from([0xF0, 0x00, 0x20, 0x29, 0x02, 0x0A, 0x78, template, pad, color, 0xF7]);
         this.LaunchControlOut.send(ledOnMsg);
      }

      getMIDIMessage(midiMessage) {
         let data = midiMessage.data; // Uint8Array(3)
         let padToChange = 0;
         if (data[0] == 184) { //KNOB

            let knobNote = data[1];
            let knobIndex = (knobNote < 40) ? knobNote - 21 : knobNote - 33;
            console.log("Knob " + knobIndex + " changed: " + data);

            //TODO RANGE; DEFAULT etc...
            this.knobSet[knobIndex].knobValue = data[2];

         } else if (data[0] == 152 && data[2] == 127) { //PAD, note ON (= when PAD is pressed)
            switch (data[1]) {
               case 9:
               case 10:
               case 11:
               case 12:
                  padToChange = data[1] - 9;
                  break;
               case 25:
               case 26:
               case 27:
               case 28:
                  padToChange = data[1] - 21;
                  break;
            } //end Switch
            console.log("You pressed pad " + padToChange);

            this.padSet[padToChange].status = !this.padSet[padToChange].status;

            if (this.padSet.padMode == PAD_MODE.RADIO) {
               
               for (let i = 0; i < this.padSet.length; i++) {
                  if (padToChange == i)
                     this.sendLedOnOff(this.padSet[padToChange].status, padToChange);
                  else {
                     //switch off all other pads
                     this.sendLedOnOff(false, i);
                     this.padSet[i].status = false;
                  }
               }
            } else if (this.padSet.padMode == PAD_MODE.TOGGLE)
               this.sendLedOnOff(this.padSet[padToChange].status, padToChange);

         }
      }


      onMIDIFailure() {
         console.log('Could not access your MIDI devices.');
      }


      onMIDISuccess(midiAccess) {

         /* TODO Do somehting when MIDI is disconnected?
         midiAccess.onstatechange = function (e) {

            // Print information about the (dis)connected MIDI controller
            console.log(e.port.name, e.port.manufacturer, e.port.state);
         };
         */


         var inputs = midiAccess.inputs;
         var outputs = midiAccess.outputs;



         for (var input of midiAccess.inputs.values()) {
            input.onmidimessage = (msg) => this.getMIDIMessage(msg);
         }

         // or you could express in ECMAScript 6 as:
         for (let output of outputs.values()) {
            if (output.name == "Launch Control") {
               this.LaunchControlOut = output;
               console.debug("Assigned MIDI output, " + output.name);
            }
         }
         if (this.LaunchControlOut == null)
            console.error("No MIDI output found!");

         var resetMsg = getResetMessage();
         this.LaunchControlOut.send(resetMsg);
         var setTemplateMsg = getSetTemplateMessage();
         this.LaunchControlOut.send(setTemplateMsg);
         console.log("MIDI controller reset!");

      }



      init() {
         navigator.requestMIDIAccess({
               sysex: true
            })
            .then((msg) => this.onMIDISuccess(msg), this.onMIDIFailure);
      }

   }

   exports.LaunchController = LaunchController;

   return exports;

}({}));
