// Import only so this file is a module.
import Vue from "vue";

declare global {
  interface Window {
    groupSketchConfig: {
      apiAddress?: string;
    };
  }
}
