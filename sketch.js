let font;
let tSize = 500; // Text Size
let tposX; // X position of text
let tposY; // Y position of text
let originalY; // Original Y position to return to
let pointCount = 0.07; // Further reduced Point count for fewer particles

let speed = 10; // Speed of the particles
let comebackSpeed = 100; // Lower the number, less interaction
let dia = 120; // Diameter of interaction
let randomPos = false; // Starting points
let pointsDirection = "left"; // Left, right, up, down general
let interactionDirection = 1; // -1 and 1

let textPoints = [];
let floatingHeys = []; // Array to store floating "HEY?" words
let smallCircles = []; // Array to store the small floating circles

let returningUp = false; // Indicates if the phrase is returning upwards
let phraseVisible = true; // Tracks if the phrase is visible
let heysMode = false; // Indicates if we should draw "HEY?" words

let magneticRange = 30; // Maximum range of magnetic effect (about 3 cm or 30 pixels)

function preload() {
  font = loadFont("AvenirNextLTPro-Demi.otf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  tposX = width / 2 - tSize * 1.2;
  tposY = height / 2 - tSize / 2.5;
  originalY = tposY; // Store the original Y position for resetting

  textFont(font);

  let points = font.textToPoints("HEY?", tposX, tposY, tSize, {
    sampleFactor: pointCount, // Reduced sample factor
  });

  // Initialize particles at the text points
  for (let i = 0; i < points.length; i++) {
    let pt = points[i];

    let textPoint = new Interact(
      pt.x,
      pt.y,
      speed,
      dia,
      randomPos,
      comebackSpeed,
      pointsDirection,
      interactionDirection
    );

    textPoints.push(textPoint);
  }
}

function draw() {
  background(0); // Keep black background to maintain focus on floating words and circles

  // Check if mouse is inside the canvas
  let mouseInsideCanvas = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;

  if (heysMode) {
    // Draw floating "HEY?" words
    for (let i = 0; i < floatingHeys.length; i++) {
      let hey = floatingHeys[i];
      fill(hey.color.levels[0], hey.color.levels[1], hey.color.levels[2], hey.opacity);
      textSize(hey.size);
      text("HEY?", hey.pos.x, hey.pos.y);

      // Apply weak magnetic force if mouse is inside the canvas
      if (mouseInsideCanvas) {
        applyMagneticForce(hey, magneticRange, 0.1); // Stronger magnetic force, limited range
      } else {
        // If mouse is outside, let them float naturally
        hey.vel.add(p5.Vector.random2D().mult(0.02)); // Slow random movement
      }

      // Update position to make it float
      hey.pos.add(hey.vel);

      // Wrap around the edges of the screen
      if (hey.pos.x > width) hey.pos.x = 0;
      if (hey.pos.x < 0) hey.pos.x = width;
      if (hey.pos.y > height) hey.pos.y = 0;
      if (hey.pos.y < 0) hey.pos.y = height;
    }

    // Draw small colorful floating circles
    for (let i = 0; i < smallCircles.length; i++) {
      let circle = smallCircles[i];
      fill(circle.color.levels[0], circle.color.levels[1], circle.color.levels[2], circle.opacity);
      noStroke();
      ellipse(circle.pos.x, circle.pos.y, circle.size);

      // Apply weak magnetic force if mouse is inside the canvas
      if (mouseInsideCanvas) {
        applyMagneticForce(circle, magneticRange, 0.1); // Stronger magnetic force, limited range
      } else {
        // If mouse is outside, let them float naturally
        circle.vel.add(p5.Vector.random2D().mult(0.02)); // Slow random movement
      }

      // Update position to make the circle float
      circle.pos.add(circle.vel);

      // Wrap around the edges of the screen
      if (circle.pos.x > width) circle.pos.x = 0;
      if (circle.pos.x < 0) circle.pos.x = width;
      if (circle.pos.y > height) circle.pos.y = 0;
      if (circle.pos.y < 0) circle.pos.y = height;
    }
  } else {
    if (phraseVisible) {
      // Update the position of each particle
      for (let i = 0; i < textPoints.length; i++) {
        let v = textPoints[i];

        // If returning up, adjust the target Y position
        if (returningUp) {
          v.target.y = lerp(v.target.y, originalY, 0.05); // Smooth transition upwards
        }

        v.update();
        v.show();
        v.behaviors();
      }
    }
  }
}

function mousePressed() {
  // After the phrase has disappeared, generate floating "HEY?" words and small circles
  if (phraseVisible) {
    // Check if the mouse is over the phrase
    let mouseInText = textPoints.some((v) => {
      let d = dist(mouseX, mouseY, v.pos.x, v.pos.y);
      return d < dia;
    });

    // Trigger disappearance if the mouse is over the text
    if (mouseInText) {
      phraseVisible = false;
    }
  } else {
    // Always make the "HEY?" words float and change positions on click
    heysMode = true;
    generateFloatingHeys(); // Populate the floatingHeys array with new positions
    generateSmallCircles(); // Generate additional small floating circles
  }
}

function generateFloatingHeys() {
  floatingHeys = []; // Clear previous floating words
  for (let i = 0; i < 50; i++) { // Generate 50 small "HEY?" words
    let hey = {
      pos: createVector(random(width), random(height)),
      vel: createVector(random(-0.5, 0.5), random(-0.5, 0.5)), // Slow floating velocity
      size: random(20, 50),
      color: color(random(255), random(255), random(255)), // Random color for each word
      opacity: random(100, 255) // Random opacity for each word
    };
    floatingHeys.push(hey);
  }
}

function generateSmallCircles() {
  // Generate a small number of floating colorful circles
  for (let i = 0; i < 30; i++) { // Number of small circles
    let circle = {
      pos: createVector(random(width), random(height)),
      vel: createVector(random(-1, 1), random(-1, 1)), // Slow random velocity
      size: random(10, 30), // Size of the circles
      color: color(random(255), random(255), random(255)), // Random color for each circle
      opacity: random(100, 255) // Random opacity for each circle
    };
    smallCircles.push(circle);
  }
}

function applyMagneticForce(obj, maxDist, strength) {
  let mousePos = createVector(mouseX, mouseY);
  let distToMouse = dist(obj.pos.x, obj.pos.y, mousePos.x, mousePos.y);

  // Only apply magnetic force if the object is within the maximum magnetic range
  if (distToMouse < maxDist) {
    // Calculate the force strength based on the distance to the mouse
    let forceStrength = map(distToMouse, 0, maxDist, strength, 0); // The closer, the stronger the force
    forceStrength = constrain(forceStrength, 0, strength); // Limit the force to the specified strength

    // Apply the force if within range
    let dir = p5.Vector.sub(mousePos, obj.pos);
    dir.setMag(forceStrength); // Apply the calculated force strength
    obj.vel.add(dir); // Apply the force to the velocity
  }
}

function Interact(x, y, m, d, t, s, di, p) {
  if (t) {
    this.home = createVector(random(width), random(height));
  } else {
    this.home = createVector(x, y);
  }
  this.pos = this.home.copy();
  this.target = createVector(x, y);

  if (di == "general") {
    this.vel = createVector();
  } else if (di == "up") {
    this.vel = createVector(0, -y);
  } else if (di == "down") {
    this.vel = createVector(0, y);
  } else if (di == "left") {
    this.vel = createVector(-x, 0);
  } else if (di == "right") {
    this.vel = createVector(x, 0);
  }

  this.acc = createVector();
  this.r = 8;
  this.maxSpeed = m;
  this.maxforce = 1;
  this.dia = d;
  this.come = s;
  this.dir = p;

  // Set initial opacity and color for each particle
  this.opacity = 255;
  this.color = color(random(255), random(255), random(255)); // Random color for each point
}

Interact.prototype.behaviors = function () {
  let arrive = this.arrive(this.target);
  let mouse = createVector(mouseX, mouseY);
  let flee = this.flee(mouse);

  this.applyForce(arrive);
  this.applyForce(flee);
};

Interact.prototype.applyForce = function (f) {
  this.acc.add(f);
};

Interact.prototype.arrive = function (target) {
  let desired = p5.Vector.sub(target, this.pos);
  let d = desired.mag();
  let speed = this.maxSpeed;
  if (d < this.come) {
    speed = map(d, 0, this.come, 0, this.maxSpeed);
  }
  desired.setMag(speed);
  let steer = p5.Vector.sub(desired, this.vel);
  return steer;
};

Interact.prototype.flee = function (target) {
  let desired = p5.Vector.sub(target, this.pos);
  let d = desired.mag();

  if (d < this.dia) {
    desired.setMag(this.maxSpeed);
    desired.mult(this.dir);
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxForce);
    return steer;
  } else {
    return createVector(0, 0);
  }
};

Interact.prototype.update = function () {
  this.pos.add(this.vel);
  this.vel.add(this.acc);
  this.acc.mult(0);
};

Interact.prototype.show = function () {
  fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], this.opacity);
  noStroke();
  ellipse(this.pos.x, this.pos.y, 16, 16);
};

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}