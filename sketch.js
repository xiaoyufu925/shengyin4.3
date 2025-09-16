let fft, video;
let bassLines = [], midLines = [], trebleLines = [];
let spacing = 40;
let micStarted = false;

function setup() {
  createCanvas(393, 852);

  let constraints = {
    audio: true,
    video: {
      facingMode: { exact: "environment" }
    }
  };

  // 摄像头初始化
  video = createCapture(constraints, () => {
    console.log("摄像头已打开");
  });
  video.size(393, 852);
  video.hide();

  // FFT 自动从 getAudioContext 获取麦克风，不再使用 mic.start()
  fft = new p5.FFT();
  micStarted = true;

  userStartAudio().then(() => {
    console.log("用户音频上下文已激活");
  }).catch(err => {
    console.error("音频启动失败:", err);
    micStarted = false;
  });

  strokeWeight(2);
}

function draw() {
  image(video, 0, 0, width, height);

  if (!micStarted) {
    fill(255);
    textAlign(CENTER, CENTER);
    text("等待麦克风授权...", width / 2, height / 2);
    return;
  }

  let spectrum = fft.analyze();
  let bassEnergy = fft.getEnergy("bass");
  let midEnergy = fft.getEnergy("mid");
  let trebleEnergy = fft.getEnergy("treble");

  let bassZone = [0, height / 3];
  let midZone = [height / 3, (2 * height) / 3];
  let trebleZone = [(2 * height) / 3, height];

  if (bassEnergy > 150) {
    bassLines.push(new AnimatedDash(color(0, 255, 0), random(bassZone[0], bassZone[1]), 3));
  }
  if (midEnergy > 150) {
    midLines.push(new AnimatedDash(color(255, 255, 0), random(midZone[0], midZone[1]), 5));
  }
  if (trebleEnergy > 150) {
    trebleLines.push(new AnimatedDash(color(255, 0, 0), random(trebleZone[0], trebleZone[1]), 7));
  }

  for (let line of bassLines) {
    line.update();
    line.display();
  }
  for (let line of midLines) {
    line.update();
    line.display();
  }
  for (let line of trebleLines) {
    line.update();
    line.display();
  }

  bassLines = bassLines.filter(l => !l.isFinished());
  midLines = midLines.filter(l => !l.isFinished());
  trebleLines = trebleLines.filter(l => !l.isFinished());
}

class AnimatedDash {
  constructor(col, yStart, speed) {
    this.y = yStart;
    this.x = 0;
    this.speed = speed;
    this.color = col;
    this.dashLength = 10;
    this.gapLength = 10;
  }

  update() {
    this.x += this.speed;
  }

  display() {
    stroke(this.color);
    for (let i = 0; i < this.x; i += this.dashLength + this.gapLength) {
      line(i, this.y, i + this.dashLength, this.y);
    }
  }

  isFinished() {
    return this.x > width;
  }
}
