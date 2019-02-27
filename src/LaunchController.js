import {
   getResetMessage,
   getSetTemplateMessage
} from './Utils.js';

import {
   LedConstants
} from './LedConstants.js';

import {
   PadSet,
   PAD_MODE
} from './PadSet.js';
import {
   KnobSet
} from './KnobSet.js';

export class LaunchController {
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
      var ctx = this;
      navigator.requestMIDIAccess({
            sysex: true
         })
         .then((msg) => this.onMIDISuccess(msg), this.onMIDIFailure);
   }

}