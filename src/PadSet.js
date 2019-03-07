import {
  Pad
} from './Pad.js'

export class PadSet {
  constructor (padCount, padMode) {
    this.padCount = padCount
    this.padMode = parseInt(padMode)

    // initialize the pad array with False => all pads are off
    this.padStatus = new Array(padCount) // Array.apply(null, new Array(padCount)).map(function(){return false});

    for (let i = 0; i < padCount; i++) {
      this[i] = new Pad('PAD_' + i)
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
