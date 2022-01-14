/// <reference path="../../TSDef/p5.global-mode.d.ts" />

// Objects
let windowSize = { w: 0, h: 0 };
const bars = [
	{ x: 0, y: 0 },
	{ x: 0, y: 0 },
];
let ball = { pos: { x: 0.5, y: 0.5 }, dest: { x: Math.abs(window.initialVel - 1), y: 0.5 } };

// Sizes
let lineWidth, barHeight;
// Speeds
const barSpeed = 0.02;
const timeToCross = 2000;

// Timing
let lastBounce;
let lastBouncePoint = { x: initialVel, y: 0.5 };

function setup() {
	windowSize = { w: (windowHeight * 4) / 3 - 4, h: windowHeight - 3 };

	lineWidth = windowSize.h / 65;
	barHeight = lineWidth * 10;

	bars[0] = { x: lineWidth * 4, y: 0.5 };
	bars[1] = { x: windowSize.w - lineWidth * 5, y: 0.5 };

	lastBounce = millis();

	createCanvas(windowSize.w, windowSize.h);
}

function draw() {
	update();

	drawBackground();
	drawBars();
	drawBall();
}

function update() {
	if (keyIsPressed) {
		let update = false;
		if (keyCode === DOWN_ARROW || key === "s") {
			bars[0].y += barSpeed;
			update = true;
		}
		if (keyCode === UP_ARROW || key === "w") {
			bars[0].y -= barSpeed;
			update = true;
		}
		if (bars[0].y > 1) bars[0].y = 1;
		if (bars[0].y < 0) bars[0].y = 0;
		if (update) {
			window.playerMoved(bars[0].y);
		}
	}

	const deltaX = ball.dest.x - lastBouncePoint.x;
	const deltaY = ball.dest.y - lastBouncePoint.y;
	console.log(deltaX, deltaY);

	ball.pos.x = lastBouncePoint.x + ((millis() - lastBounce) / timeToCross) * deltaX;
	ball.pos.y = lastBouncePoint.y + ((millis() - lastBounce) / timeToCross) * deltaY;
	if (ball.pos.y < 0) ball.pos.y = -ball.pos.y;
	if (ball.pos.y > 1) ball.pos.y = 1 - (ball.pos.y - 1);

	if (ball.pos.x < 0) {
		if (ball.pos.x < -0.02) {
			window.lose();
			return;
		}
		if (ballTouchesBar()) {
			lastBouncePoint = { ...ball.pos };
			ball.dest = { x: Math.abs(ball.pos.x - 1), y: random(-0.5, 1.5) };
			lastBounce = millis();
			window.bounce({ pos: { x: ball.pos.x, y: ball.pos.y }, dest: { ...ball.dest } });
		}
	}
}

function drawBall() {
	push();
	noFill();
	fill(255);
	const { x, y } = getComputedBallPos(ball.pos.x, ball.pos.y);
	rect(x, y, lineWidth, lineWidth);
	pop();
}

function drawBars() {
	push();
	noStroke();
	fill(255);
	bars.forEach(({ x, y }) => {
		const yy = getComputedBarPos(y);
		rect(x, yy, lineWidth, barHeight);
	});
	pop();
}

function drawBackground() {
	background(0);

	const { w, h } = windowSize;

	push();
	noStroke();
	rect(lineWidth, lineWidth, w - lineWidth * 2, lineWidth);
	rect(lineWidth, h - lineWidth * 2, w - lineWidth * 2, lineWidth);

	rect(lineWidth, lineWidth, lineWidth, h - lineWidth * 2);
	rect(w - lineWidth * 2, lineWidth, lineWidth, h - lineWidth * 2);
	pop();
}

function ballTouchesBar() {
	const { y } = getComputedBallPos(ball.pos.x, ball.pos.y);
	const barPos = getComputedBarPos(bars[0].y) + barHeight / 2;
	const delta = Math.abs(barPos - y);
	if (delta < barHeight / 2 + lineWidth / 2) return true;
	return false;
}

function getComputedBallPos(x, y) {
	const wOffset = lineWidth * 5 + lineWidth / 2;
	const hOffset = lineWidth * 2 + lineWidth / 2;
	const w = windowSize.w - wOffset * 2;
	const h = windowSize.h - hOffset * 2;
	return { x: x * w - lineWidth / 2 + wOffset, y: y * h - lineWidth / 2 + hOffset };
}

function getComputedBarPos(y) {
	return y * (windowSize.h - barHeight - lineWidth * 4) + lineWidth * 2;
}

window.updateBar = ({ data }) => {
	bars[1].y = data;
};

window.onBounce = (data) => {
	console.log("bounce received", data);
	lastBounce = millis();
	lastBouncePoint = { ...data.pos };
	ball.pos = data.pos;
	ball.dest = data.dest;
};
