let lenna;
let pointCount = 500;
let vectors = [];
let pointsCopy = [];
let imgWidth;
let imgHeight;
let triangulation;

// navigate to http://127.0.0.1:8887
function preload() {
  // lenna = loadImage('assets/lenna.png');
  lenna = loadImage('assets/redfoxHead.jpg');
}

function setup() {
  imgWidth = lenna.width;
  imgHeight = lenna.height;

  createCanvas(imgWidth * 2, imgHeight);
  background(220);
  image(lenna, imgWidth, 0);
  lenna.loadPixels();
  // edge cases 100, 101, 105, 107
  randomSeed(119);
  for (let i = 0; i < pointCount; i++) {
    vectors.push(createVector(Math.floor(random(imgWidth)), Math.floor(random(imgHeight))));
    pointsCopy.push(vectors[i].copy());
  } 

  triangulation = new Triangulation(vectors);
  noStroke();
  triangulation.drawTriangulation();

  // fill(255, 255, 255);
  // for (let i = 0; i < pointsCopy.length; i++) {
  //   ellipse(pointsCopy[i].x, pointsCopy[i].y, 4, 4);
  // }

  let loops = 0;
  let interval = setInterval(() => {
    loops++;
    console.log("Loop Number: ", loops);
    triangulation.errorImprovement();
    triangulation.drawTriangulation();

    if (loops == 2) {
      clearInterval(interval);
    }
  }, 500);
}

function draw() {
}
