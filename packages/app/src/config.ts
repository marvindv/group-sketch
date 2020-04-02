const config = {
  apiAddress: () =>
    window["groupSketchConfig"] ? window["groupSketchConfig"].apiAddress : ""
};
export default config;
