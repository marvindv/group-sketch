<template>
  <div class="home">
    <SketchPad ref="sketchPad" @next-path="onNextPath" />

    <button type="button" @click="onClearClick">Clear</button>
    <button type="button" @click="onRedrawClick">Redraw</button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Ref, Emit } from "vue-property-decorator";

import SketchPad from "@/components/SketchPad.vue";
import Path from "@/models/Path";

@Component({
  components: { SketchPad }
})
export default class Home extends Vue {
  @Ref() readonly sketchPad: SketchPad | undefined;

  paths: Path[] = [];

  onNextPath(path: Path) {
    this.paths = [...this.paths, path];
  }

  onClearClick() {
    this.sketchPad!.clear();
  }

  onRedrawClick() {
    this.sketchPad!.drawPaths(this.paths);
  }
}
</script>
