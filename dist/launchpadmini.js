var LaunchPadMiniJS = (function (exports) {
  'use strict';

  function getResetMessage () {
    return Uint8Array.from([184, 0, 0])
  }

  function getSetTemplateMessage () {
    var template = 0x08;
    return Uint8Array.from([0xF0, 0x00, 0x20, 0x29, 0x02, 0x0A, 0x77, template, 0xF7])
  }

  var LedConstants = (function () {
    function LedConstants () {
    }

    return LedConstants
  }());
  LedConstants.OFF = 12;
  LedConstants.RED_LOW = 13;
  LedConstants.RED_FULL = 15;
  LedConstants.AMBER_LOW = 29;
  LedConstants.AMBER_FULL = 63;
  LedConstants.YELLOW_FULL = 62;
  LedConstants.GREEN_LOW = 28;
  LedConstants.GREEN_FULL = 60;
  LedConstants['__class'] = 'LedConstants';

  class Pad {
    constructor (name, code) {
      this.name = name;
      this.code = code;
      this.note = 0;
      this.status = false;
    }
  }

  class PadSet {
    constructor (padCount, padMode) {
      this.padCount = padCount;
      this.padMode = parseInt(padMode);

      // initialize the pad array with False => all pads are off
      this.padStatus = new Array(padCount); // Array.apply(null, new Array(padCount)).map(function(){return false});

      for (let i = 0; i < padCount; i++) {
        this[i] = new Pad('PAD_' + i);
      }
    }

    get length () {
      return this.padCount
    }
    getPad (padIndex) {
      return this[padIndex]
    }

    get firstSelected () {
      for (let i = 0; i < this.padCount; i++) {
        if (this[i].status === true) {
          return this[i].code
        }
      }
    }
  }

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

  class LaunchPadMini {
    constructor () {
      this.LaunchControlOut = null;
      this.padSet = new PadSet(64, PAD_MODE.RADIO);
    }

    sendLedOnOff (onOff, pad) {
      let color = onOff ? LedConstants.RED_FULL : LedConstants.OFF;
      let ledOnMsg = Uint8Array.from([0x90, pad, color]);
      this.LaunchControlOut.send(ledOnMsg);
    }

    getMIDIMessage (midiMessage) {
      let data = midiMessage.data; // Uint8Array(3)
      console.log('Received msg.:' + data);
      if (data[0] === 144 && data[2] === 127) { // PAD "note on"
        let noteHex = data[1].toString(16);

        // pading a zero
        if (noteHex.length === 1) { noteHex = '0' + noteHex; }

        let row = parseInt(noteHex.substring(0, 1));
        let col = parseInt(noteHex.substring(1, 2));
        let padIndex = row * 8 + col;

        console.log(`x,y={row},{col} Pad:{padIndex} changed: {data}`);

        this.padSet[padIndex].note = data[1];
        this.padSet[padIndex].status = !this.padSet[padIndex].status;

        if (this.padSet.padMode === PAD_MODE.RADIO) {
          for (let i = 0; i < this.padSet.length; i++) {
            if (padIndex === i) {
              this.sendLedOnOff(this.padSet[padIndex].status, this.padSet[padIndex].note);
            } else {
              // switch off all other pads
              this.sendLedOnOff(false, i);
              this.padSet[i].status = false;
            }
          }
        } else if (this.padSet.padMode === PAD_MODE.TOGGLE) { this.sendLedOnOff(this.padSet[padIndex].status, this.padSet[padIndex].note); }
      }
    }

    onMIDIFailure () {
      console.log('Could not access your MIDI devices.');
    }

    onMIDISuccess (midiAccess) {
      /* TODO Do somehting when MIDI is disconnected?
          midiAccess.onstatechange = function (e) {

             // Print information about the (dis)connected MIDI controller
             console.log(e.port.name, e.port.manufacturer, e.port.state);
          };
          */

      var outputs = midiAccess.outputs;

      for (var input of midiAccess.inputs.values()) {
        input.onmidimessage = (msg) => this.getMIDIMessage(msg);
      }

      // or you could express in ECMAScript 6 as:
      for (let output of outputs.values()) {
        if (output.name === 'Launchpad Mini') {
          this.LaunchControlOut = output;
          console.debug('Assigned MIDI output, ' + output.name);
        }
      }
      if (this.LaunchControlOut == null) { console.error('No MIDI output found!'); }

      var resetMsg = getResetMessage();
      this.LaunchControlOut.send(resetMsg);
      var setTemplateMsg = getSetTemplateMessage();
      this.LaunchControlOut.send(setTemplateMsg);
      console.log('MIDI controller reset!');
    }

    init () {
      navigator.requestMIDIAccess({
        sysex: true
      })
        .then((msg) => this.onMIDISuccess(msg), this.onMIDIFailure);
    }
  }

  exports.LaunchPadMini = LaunchPadMini;

  return exports;

}({}));
