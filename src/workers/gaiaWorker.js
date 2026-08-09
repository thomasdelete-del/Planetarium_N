import { compactGaiaCatalog } from "../gaia/compact.js";

self.addEventListener("message", ({ data }) => {
  try {
    const result = compactGaiaCatalog(data.buffer, data.gridRa, data.gridDec, data.namedStars);
    self.postMessage({
      buffer: result.buffer,
      count: result.count,
      duplicateCount: result.duplicateCount
    }, [result.buffer]);
  } catch (error) {
    self.postMessage({ error: error instanceof Error ? error.message : String(error) });
  }
});
