/*
 * p5.js specific content
 */

var controller;
var s = 35;
function setup() {
   var myCanvas = createCanvas(16*s, 250);
   myCanvas.parent('sketch');

   //controller = new LaunchController();
   controller = window.controller;
   controller.init();
}

function draw() {
   background(80);
   translate(s/2,0);
   ellipseMode(CORNER);
   
   //drawing 8 knobs, upper row

  //drawing positions for arcs
  var start = HALF_PI * 1.3;
  var end = TWO_PI + HALF_PI * .7;

   for (var i = 0; i < 16; i++) {
      var x = s * 2 * (i % 8);
      var y = 2*s * (.5 + int(i/8));
      fill(0);
      ellipse(x, y , s, s);
      
      fill(120);
      var normal =controller.knobPositions[i] / 127;
      arc(x, y, s, s, start, start + normal*(end-start),PIE);
      fill(255);
      text(controller.knobPositions[i],x,y);
   }  
   // drawing 8as * (1 +s   
   translate(0,4*s);
   for (var i = 0; i < 8; i++) {
      if (controller.padStatus[i] == true) {
         strokeWeight(2);
         stroke(0);
         fill(255, 0, 0);
         rect(s * 2 * i, 50, s, s);

      } else {
         noFill();
         rect(s * 2 * i, 50, s, s);
      }
   }

}