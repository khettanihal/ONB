let width = 800;
let height = 600;
let numTrials = 12;
let targetRadius = 12;
let cursorRadius = 8;
let margin = 60;
let trial = 0;
let running = false;
let startTime, globalStart;
let targets = [];
let flipX = true;
let flipY = true;
let currentColor;
let results = [];

let colors = [
  [158, 0, 255],
  [0, 128, 255],
  [255, 105, 180],
  [174, 0, 0],
  [255, 140, 0]
];

function setup() {
  createCanvas(width, height);
  noCursor();
  textSize(16);
  textFont('monospace');

  // Generate targets
  for (let i = 0; i < numTrials; i++) {
    let x = random(margin, width - margin);
    let y = random(margin, height - margin);
    targets.push([x, y]);
  }

  currentColor = random(colors);
}

function draw() {
  background(255);
  fill(0);
  text("SPACE: start   LEFT-CLICK: submit   X/Y: flip axis", 10, 20);
  text(`FlipX: ${flipX}  FlipY: ${flipY}`, 10, 40);

  if (running && trial > 0 && trial <= numTrials) {
    let t = targets[trial - 1];
    fill(currentColor);
    ellipse(t[0], t[1], targetRadius * 2);

    // show timer only after trial 6
    if (trial >= 6) {
      fill(120, 0, 0);
      text(`Timer: ${(millis() - globalStart) / 1000.0}s`, width - 200, 20);
    }

    fill(0);
    text(`Trial ${trial}/${numTrials}`, 10, height - 20);
  } else if (!running && trial === 0) {
    text("Press SPACE to begin.", 10, height - 20);
  } else if (!running && trial > numTrials) {
    fill(0, 150, 0);
    text("Experiment complete. CSV downloaded.", 10, height - 20);
  }

  // draw cursor
  let [fx, fy] = flipped(mouseX, mouseY);
  fill(220, 20, 60);
  ellipse(fx, fy, cursorRadius * 2);
}

function flipped(x, y) {
  let fx = flipX ? width - x : x;
  let fy = flipY ? height - y : y;
  return [fx, fy];
}

function keyPressed() {
  if (key === ' ') {
    if (!running) {
      running = true;
      trial = 1;
      globalStart = millis();
      startTime = millis();
      console.log("Experiment started");
    }
  }
  if (key === 'X') flipX = !flipX;
  if (key === 'Y') flipY = !flipY;
}

function mousePressed() {
  if (!running || trial > numTrials) return;

  // change color every 4 trials
  if ((trial - 1) % 4 === 0) {
    currentColor = random(colors);
  }

  let [fx, fy] = flipped(mouseX, mouseY);
  let t = targets[trial - 1];
  let error = dist(fx, fy, t[0], t[1]);
  let now = millis();
  let trialTime = (now - startTime) / 1000.0;
  let globalTime = (now - globalStart) / 1000.0;

  results.push({
    trial: trial,
    target_x: t[0],
    target_y: t[1],
    raw_mouse_x: mouseX,
    raw_mouse_y: mouseY,
    flipped_x: fx,
    flipped_y: fy,
    error_pixels: error.toFixed(3),
    trial_time_s: trialTime.toFixed(3),
    global_time_s: globalTime.toFixed(3),
    flip_x: flipX,
    flip_y: flipY,
    color: currentColor.toString()
  });

  trial++;
  if (trial <= numTrials) {
    startTime = millis();
  } else {
    running = false;
    downloadCSV(results);
  }
}

function downloadCSV(data) {
  let csv = Papa.unparse(data);
  let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  let link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `results_${Date.now()}.csv`;
  link.click();
}
