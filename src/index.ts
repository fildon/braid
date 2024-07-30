import { type Braid, handleCrossingRequest } from "./braid";

document.addEventListener("DOMContentLoaded", () => {
  let braid: Braid = {
    length: 10,
    ropes: 10,
    crossings: new Set(),
  };
  // TODO register click handlers
  // click handlers should update state
  // and trigger a repaint of state to screen
  console.log("hello");
});
