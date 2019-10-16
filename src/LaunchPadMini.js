import {
  getResetMessage,
  getSetTemplateMessage
} from './Utils.js'

import {
  LedConstants
} from './LedConstants.js'

import {
  PadSet
} from './PadSet.js'

import {
  PAD_MODE
} from './PAD_MODE.js'

export class LaunchPadMini {
  constructor () {
    this.LaunchControlOut = null
    this.padSet = new PadSet(64, PAD_MODE.RADIO)
  }

  sendLedOnOff (onOff, pad) {
    let color = onOff ? LedConstants.YELLOW_FULL : LedConstants.OFF
    let ledOnMsg = Uint8Array.from([0x90, pad, color])
    this.LaunchControlOut.send(ledOnMsg)
  }

  getMIDIMessage (midiMessage) {
    let data = midiMessage.data // Uint8Array(3)
    console.log('Received msg.:' + data)
    if (data[0] === 144 && data[2] === 127) { // PAD "note on"
      let noteHex = data[1].toString(16)

      // pading a zero
      if (noteHex.length === 1) { noteHex = '0' + noteHex }

      let row = parseInt(noteHex.substring(0, 1))
      let col = parseInt(noteHex.substring(1, 2))
      let padIndex = row * 8 + col

      console.log(`x,y={row},{col} Pad:{padIndex} changed: {data}`)

      this.padSet[padIndex].note = data[1]
      this.padSet[padIndex].status = !this.padSet[padIndex].status

      if (this.padSet.padMode === PAD_MODE.RADIO) {
        for (let i = 0; i < this.padSet.length; i++) {
          if (padIndex === i) {
            this.sendLedOnOff(this.padSet[padIndex].status, this.padSet[padIndex].note)
          } else {
            // switch off all other pads
            this.sendLedOnOff(false, i)
            this.padSet[i].status = false
          }
        }
      } else if (this.padSet.padMode === PAD_MODE.TOGGLE) { this.sendLedOnOff(this.padSet[padIndex].status, this.padSet[padIndex].note) }
    }
  }

  onMIDIFailure () {
    console.log('Could not access your MIDI devices.')
  }

  onMIDISuccess (midiAccess) {
    /* TODO Do somehting when MIDI is disconnected?
        midiAccess.onstatechange = function (e) {

           // Print information about the (dis)connected MIDI controller
           console.log(e.port.name, e.port.manufacturer, e.port.state);
        };
        */

    var outputs = midiAccess.outputs

    for (var input of midiAccess.inputs.values()) {
      input.onmidimessage = (msg) => this.getMIDIMessage(msg)
    }

    // or you could express in ECMAScript 6 as:
    for (let output of outputs.values()) {
      if (output.name === 'Launchpad Mini') {
        this.LaunchControlOut = output
        console.debug('Assigned MIDI output, ' + output.name)
      }
    }
    if (this.LaunchControlOut == null) { console.error('No MIDI output found!') }

    var resetMsg = getResetMessage()
    this.LaunchControlOut.send(resetMsg)
    var setTemplateMsg = getSetTemplateMessage()
    this.LaunchControlOut.send(setTemplateMsg)
    console.log('MIDI controller reset!')
  }

  init () {
    var ctx = this
    navigator.requestMIDIAccess({
      sysex: true
    })
      .then((msg) => this.onMIDISuccess(msg), this.onMIDIFailure)
  }
}
