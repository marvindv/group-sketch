<template>
  <div class="sketch-pad">
    <canvas
      ref="canvas"
      @mouseup="onMouseUp"
      @mousemove="onMouseMove"
      @mouseleave="onMouseLeave"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      width="500"
      height="500"
    ></canvas>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Ref, Emit, Prop } from "vue-property-decorator";

import { Path, Point } from "@group-sketch/shared";

/**
 * The component the user can draw on and displays drawings of other users.
 */
@Component
export default class SketchPad extends Vue {
  @Ref() readonly canvas!: HTMLCanvasElement;

  @Prop({ type: Boolean, required: true }) readonly enabled!: boolean;

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
    const coords = this.getMouseCoords(event);
    this.processCoords(coords, event.buttons === 1);
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

  onTouchStart(event: TouchEvent) {
    const coords = this.getTouchCoords(event);
    this.prevX = coords[0];
    this.prevY = coords[1];

    event.preventDefault();
    return false;
  }

  onTouchMove(event: TouchEvent) {
    event.preventDefault();

    if (event.touches) {
      if (event.touches.length == 1) {
        // Ignore touch inputs with more than one finger.
        const coords = this.getTouchCoords(event);
        this.processCoords(coords, true);
      }
    }

    return false;
  }

  onTouchEnd(event: TouchEvent) {
    this.completeCurrentPath();
    event.preventDefault();
    return false;
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
      this.ctx.clearRect(0, 0, 500, 500);
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

  private getMouseCoords(event: MouseEvent): Point {
    const canvas = event.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();

    return [event.clientX - rect.left, event.clientY - rect.top];
  }

  private getTouchCoords(event: TouchEvent): Point {
    const canvas = event.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();

    return [
      event.touches[0]!.clientX - rect.left,
      event.touches[0]!.clientY - rect.top
    ];
  }

  /**
   * Processes new coords, either from mouse or from touch input.
   *
   * @param {boolean} drawLine The value indicating whether the line should actually be drawn to
   *   this coordinates. If this is `false`, the properties `prevX` and `prevY` will still be set.
   */
  private processCoords(coords: [number, number], drawLine: boolean) {
    const [x, y] = coords;

    if (
      this.ctx &&
      this.prevX !== null &&
      this.prevY !== null &&
      this.enabled &&
      drawLine
    ) {
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

    this.prevX = x;
    this.prevY = y;
  }

  private drawBorder() {
    if (!this.ctx) {
      return;
    }

    this.ctx.beginPath();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "rgba(0, 0, 0, 0.125)";
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(500, 0);
    this.ctx.lineTo(500, 500);
    this.ctx.lineTo(0, 500);
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
