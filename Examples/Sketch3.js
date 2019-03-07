/*
 * p5.js specific content
 */

var controller
var s = 35
function setup () {
  var myCanvas = createCanvas(16 * s, 16 * s)
  myCanvas.parent('sketch')

  // controller = new LaunchController();
  controller = window.controller
  controller.init()

  createP('Operation of pads: ')
  radio = createRadio()
  radio.option('Toggle', 1)
  radio.option('Radio', 2)
  radio._getInputChildrenArray()[0].checked = true
}

function draw () {
  // adjusting PadSet mode
  var padOption = radio.value()
  controller.padSet.padMode = parseInt(padOption)
  background(80)
  translate(s / 2, s / 2)

  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      let ix = j * 8 + i
    if (controller.padSet[ix].status == true) {
        strokeWeight(2)
        stroke(0)
        fill(255, 0, 0)
        rect(s * 2 * i, s * 2 * j, s, s)
      } else {
        noFill()
        rect(s * 2 * i, s * 2 * j, s, s)
      }
    }
  }
}
