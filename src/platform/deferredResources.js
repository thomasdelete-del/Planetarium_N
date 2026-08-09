const DEFERRED_STYLESHEET_SELECTOR = "link[data-deferred-stylesheet]";

export function activateDeferredStylesheets({
  documentObject = document,
  requestFrame = requestAnimationFrame
} = {}) {
  const stylesheets = Array.from(
    documentObject.querySelectorAll(DEFERRED_STYLESHEET_SELECTOR)
  );

  if (stylesheets.length === 0) return () => {};

  let active = true;
  requestFrame(() => {
    requestFrame(() => {
      if (!active) return;
      stylesheets.forEach((stylesheet) => {
        stylesheet.media = stylesheet.dataset.activeMedia || "all";
        stylesheet.removeAttribute("data-deferred-stylesheet");
      });
    });
  });

  return () => {
    active = false;
  };
}
