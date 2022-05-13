let lenna;
let pointCount = 50;
let vectors = [];
let pointsCopy = [];
let imgWidth = 512;
let imgHeight = 512;
let triangulation;

// navigate to http://127.0.0.1:8887
function preload() {
  lenna = loadImage('assets/Lenna.png');
}

function setup() {
  createCanvas(1024, 512);
  background(220);
  image(lenna, 512, 0);
  lenna.loadPixels();
  // edge cases 100, 101, 105, 107
  randomSeed(107);
  for (let i = 0; i < pointCount; i++) {
    vectors.push(createVector(Math.floor(random(512)), Math.floor(random(512))));
    pointsCopy.push(vectors[i].copy());
  } 

  triangulation = new Triangulation(vectors);

  triangulation.drawTriangulation();

  fill(255, 255, 255);
  for (let i = 0; i < pointsCopy.length; i++) {
    ellipse(pointsCopy[i].x, pointsCopy[i].y, 4, 4);
  }

}

function draw() {
}
