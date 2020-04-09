const config = {
  apiAddress: () =>
    (window["groupSketchConfig"] && typeof  window["groupSketchConfig"].apiAddress === "string")
      ? window["groupSketchConfig"].apiAddress
      : ""
};
export default config;
