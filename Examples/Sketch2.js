/*
 * p5.js specific content
 */

var controller;

let palette = ['#CF8882', '#3F2F30','#625E49','#EFD687','#F29C95', '#335145','#28112B','#8DAA91'];

function setup() {
   var myCanvas = createCanvas(800, 400);
   myCanvas.parent('sketch');

   //controller = new LaunchController();
   controller = window.controller;
   controller.init();
   palette = palette.map(i => color(i));

   createP("Knobs 1: overall size");
   createP("Knobs 2: shape");
   createP("Knobs 3-4: noise factor and noise speed ");
   createP("Pads: choose between palette");
    
}

function draw() {
   background(255,20);
   noStroke();
   fill(0);
  

   
   let start = 0;
   let end = TWO_PI;
   let inc = 0.05;
   translate(width/2, height/2);
   fill(palette[controller.padSet.firstSelected || 0]);
   beginShape();
   for (var angle = start; angle <= end; angle += inc) {
      let r = 100;
      var amplitude = 30 * (1. * controller.knobSet[0].knobValueNormal);
      var frequency = int(1 + 10 * (1. * controller.knobSet[1].knobValueNormal));
      var noiseF = 50 * controller.knobSet[2].knobValueNormal;
      var noiseSpeed = 0.01*controller.knobSet[3].knobValueNormal;

      
      r += amplitude * cos(angle * frequency) + noise(cos(angle)*millis()*noiseSpeed)*noiseF;


      let x = r * sin(angle);
      let y = r * cos(angle);
      vertex(x, y);

   }
   endShape(CLOSE);
}