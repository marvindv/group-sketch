<template>
  <div class="sketch-pad">
    <canvas
      ref="canvas"
      @mouseup="onMouseUp"
      @mousemove="onMouseMove"
      @mouseleave="onMouseLeave"
      width="400"
      height="400"
    ></canvas>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Ref, Emit } from "vue-property-decorator";

import { Path, Point } from "@group-sketch/shared";

/**
 * The component the user can draw on and displays drawings of other users.
 */
@Component
export default class SketchPad extends Vue {
  @Ref() readonly canvas!: HTMLCanvasElement;

  private ctx: CanvasRenderingContext2D | null = null;

  private prevX: number | null = null;
  private prevY: number | null = null;
  private currentPath: Path = [];

  mounted() {
    this.ctx = this.canvas.getContext("2d");
    this.drawBorder();
  }

  /**
   * This method is called whenever the mouse moves over the canvas. If the mouse button is pressed,
   * a line is drawn.
   */
  onMouseMove(event: MouseEvent) {
    const coords = this.getCoords(event);
    const [x, y] = coords;

    if (this.ctx && this.prevX !== null && this.prevY !== null) {
      if (event.buttons === 1) {
        this.ctx.beginPath();
        this.ctx.lineWidth = 1;
        this.ctx.lineCap = "round";
        this.ctx.strokeStyle = "blue";
        this.ctx.moveTo(this.prevX, this.prevY);
        this.ctx.lineTo(x, y);
        this.currentPath.push(coords);

        this.ctx.stroke();
        this.ctx.closePath();
      }
    }

    this.prevX = x;
    this.prevY = y;
  }

  /**
   * This method is called whenever - after the mouse button is clicked on the canvas - the mouse
   * button is released. If a path was drawn, the path is emitted via the `next-path` event.
   */
  onMouseUp() {
    this.completeCurrentPath();
  }

  onMouseLeave() {
    this.completeCurrentPath();
  }

  @Emit("next-path")
  emitNextPath() {
    return this.currentPath;
  }

  /**
   * Clears the underlying canvas, removing all paths drawn on it.
   */
  clear() {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, 400, 400);
      this.drawBorder();
    }
  }

  /**
   * Draws an array of paths on the underlying canvas.
   */
  drawPaths(paths: Path[]) {
    if (!this.ctx) {
      return;
    }

    for (const path of paths) {
      this.ctx.beginPath();
      this.ctx.lineWidth = 1;
      this.ctx.lineCap = "round";
      this.ctx.strokeStyle = "blue";

      let prevPoint: Point | undefined;
      for (const p of path) {
        if (!prevPoint) {
          prevPoint = p;
          continue;
        }

        this.ctx.moveTo(prevPoint[0], prevPoint[1]);
        this.ctx.lineTo(p[0], p[1]);

        prevPoint = p;
      }

      this.ctx.stroke();
      this.ctx.closePath();
    }
  }

  private getCoords(event: MouseEvent): Point {
    const canvas = event.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();

    return [event.clientX - rect.left, event.clientY - rect.top];
  }

  private drawBorder() {
    if (!this.ctx) {
      return;
    }

    this.ctx.beginPath();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "black";
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(400, 0);
    this.ctx.lineTo(400, 400);
    this.ctx.lineTo(0, 400);
    this.ctx.lineTo(0, 0);
    this.ctx.stroke();
    this.ctx.closePath();
  }

  private completeCurrentPath() {
    if (this.currentPath.length > 1) {
      this.emitNextPath();
    }

    this.currentPath = [];
  }
}
</script>

<style scoped lang="scss"></style>
