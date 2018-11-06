import {
   getResetMessage,
   getSetTemplateMessage
} from './Utils.js';

import {
   LedConstants
} from './LedConstants.js';



import * as PADS from './Pads.js';

export class LaunchController {
   constructor() {
      this.LaunchControlOut = null;
      this.padStatus = Array.apply(null, new Array(8)).map(function(){return false});
      this.knobPositions = new Uint8Array(16);
   }

   sendLedOnOff(onOff, pad) {

      //Hex version F0h 00h 20h 29h 02h 0Ah 78h [Template] [LED] Value F7h
      //Where Template is 00h-07h (0-7) for the 8 user templates, and 08h-0Fh (8-15) for the 8 factory
      //templates; LED is the index of the pad/button (00h-07h (0-7) for pads, 08h-0Bh (8-11) for buttons);
      //and Value is the velocity byte that defines the brightness values of both the red and green LEDs.
      let template = 0x08;
      let color = onOff ? LedConstants.RED_FULL : LedConstants.OFF;
      let ledOnMsg = Uint8Array.from([0xF0, 0x00, 0x20, 0x29, 0x02, 0x0A, 0x78, template, pad.code, color, 0xF7]);
      this.LaunchControlOut.send(ledOnMsg);
   }

   getMIDIMessage(midiMessage) {
      let data = midiMessage.data; // Uint8Array(3)
      let padToChange = null;
      if (data[0] == 184) { //KNOB
         console.log("You changed a knob! " + data);
         let knobNote = data[1];
         let knobIndex = ( knobNote < 40) ? knobNote -21 : knobNote -33;
         //TODO RANGE; DEFAULT etc...
         this.knobPositions[knobIndex] = data[2];

      } else if (data[0] == 152 && data[2] == 127) { //PAD, note ON (= when PAD is pressed)
         switch (data[1]) {
            case 9:
               padToChange = PADS.PAD_1();
               break;
            case 10:
               padToChange = PADS.PAD_2();
               break;
            case 11:
               padToChange = PADS.PAD_3();

               break;
            case 12:
               padToChange = PADS.PAD_4();
               break;
            case 25:
               padToChange = PADS.PAD_5();
               break;
            case 26:

               padToChange = PADS.PAD_6();

               break;
            case 27:

               padToChange = PADS.PAD_7();

               break;
            case 28:

               padToChange = PADS.PAD_8();

               break;
         } //end Switch
         console.log("You pressed pad " + padToChange.name);

         this.padStatus[padToChange.code] = ! this.padStatus[padToChange.code];
        
         this.sendLedOnOff(this.padStatus[padToChange.code],padToChange);

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
      var ctx = this;
      navigator.requestMIDIAccess({
            sysex: true
         })
         .then((msg) => this.onMIDISuccess(msg), this.onMIDIFailure);
   }

}