import { getDivision } from "./utils.js";
import { DIVISION } from "./constants.js";

const PIx2 = Math.PI * 2;

class App {
  constructor() {
    this.canvas = document.createElement("canvas");
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");

    this.pixelRatio = window.devicePixelRatio > 1 ? 2 : 1;

    this.strings = [];
    this.moveX = -5000;
    this.moveY = -5000;
    this.isDown = false;

    window.addEventListener("resize", this.resize.bind(this), false);
    this.resize();

    window.requestAnimationFrame(this.animate.bind(this));

    this.canvas.addEventListener("click", this.onClick.bind(this), false);
  }

  t = 0;

  get p() {
    return Math.round(((Math.cos(this.t % PIx2) + 1) * DIVISION) / 2);
  }

  dots = [];

  curve = new Map();

  onClick(e) {
    const { offsetX, offsetY } = e;
    this.dots.push({ x: offsetX, y: offsetY });
    this.curve.clear();
    this.t = 0;
  }

  resize() {
    this.stageWidth = document.body.clientWidth;
    this.stageHeight = document.body.clientHeight;

    this.canvas.width = this.stageWidth * this.pixelRatio;
    this.canvas.height = this.stageHeight * this.pixelRatio;
    this.ctx.scale(this.pixelRatio, this.pixelRatio);
  }

  animate() {
    window.requestAnimationFrame(this.animate.bind(this));
    this.ctx.clearRect(0, 0, this.stageWidth, this.stageHeight);
    this.t += 0.02;

    let curveEnd = null;

    if (this.dots.length >= 2) {
      curveEnd = this.drawLines(this.dots) ?? this.dots[0];
    }

    if (this.dots.length >= 3) {
      this.drawCurve(curveEnd);
      this.dot(curveEnd?.x, curveEnd?.y, "#ff0000");
    }

    this.dots.forEach((dot) => {
      this.dot(dot.x, dot.y);
    });
  }

  drawCurve({ x, y }) {
    const values = [...this.curve.entries()]
      .sort((a, b) => a[0] - b[0])
      .map((v) => v[1]);

    if (values.length >= 2) {
      values.reduce((prev, cur) => {
        this.line(prev.x, prev.y, cur.x, cur.y, 3, "rgba(0, 0, 255, 0.2)");
        return cur;
      });
    }

    const targetIndex = values.findIndex((v) => v.x === x && v.y === y);

    const splited = values.splice(targetIndex);

    if (splited.length < 2) return;

    splited.reduce((prev, cur) => {
      this.line(prev.x, prev.y, cur.x, cur.y, 3, "#00ff00");
      return cur;
    });
  }

  drawLines(dots) {
    const divisions = [];
    dots.reduce((prev, cur) => {
      const division = this.draw(prev.x, prev.y, cur.x, cur.y);
      divisions.push(division);
      return cur;
    });

    if (divisions.length > 1) {
      if (divisions[0].length > 0) {
        const next = divisions.map((division) => division[division.length - 1]);

        return this.drawLines(next);
      }
    } else {
      const division = divisions[0];
      const dot = division.at(-1);
      this.curve.set(this.p, dot);
      return dot;
    }
  }

  draw(startX, startY, endX, endY) {
    const division = this.getDivision(startX, startY, endX, endY);
    const len = division.length;

    this.line(startX, startY, endX, endY, 6, "#000000");

    if (!len) {
      this.dot(startX, startY);
      this.dot(endX, endY);
      return division;
    }
    if (len >= DIVISION) {
      division.push({ x: endX, y: endY });
    }

    division.reduce((prev, cur) => {
      this.line(prev.x, prev.y, cur.x, cur.y, 6, "#eeeeee");
      return cur;
    });

    this.dot(division[division.length - 1].x, division[division.length - 1].y);
    this.dot(startX, startY);
    this.dot(endX, endY);

    return division;
  }

  getDivision(startX, startY, endX, endY, p = this.p) {
    return getDivision(startX, startY, endX, endY, p);
  }

  line(startX, startY, endX, endY, lineWidth = 6, color = "#eeeeee") {
    this.ctx.beginPath();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();
  }

  dot(x, y, color = "#000000", radius = 6) {
    this.ctx.beginPath();
    this.ctx.fillStyle = color;
    this.ctx.arc(x, y, radius, 0, PIx2);
    this.ctx.fill();
  }
}

window.onload = () => {
  new App();
};
