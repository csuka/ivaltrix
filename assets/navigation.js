// Fresh visits and reloads start at the introduction. Ordinary section links
// and Back/Forward navigation keep their native browser behavior.
(() => {
  const navigation = performance.getEntriesByType("navigation")[0];
  if (navigation && navigation.type === "back_forward") return;

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  // Remove a section fragment before the browser lays out its target.
  if (location.hash) {
    try {
      history.replaceState(history.state, "", location.pathname + location.search);
    } catch {
      // Some file:// viewers restrict history updates; the scroll reset still works.
    }
  }

  let interacted = false;
  const markInteraction = () => { interacted = true; };
  for (const event of ["pointerdown", "keydown", "wheel", "touchstart"]) {
    window.addEventListener(event, markInteraction, { once: true, passive: true });
  }

  window.addEventListener("pageshow", (event) => {
    if (!event.persisted && !interacted) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    for (const name of ["pointerdown", "keydown", "wheel", "touchstart"]) {
      window.removeEventListener(name, markInteraction);
    }
  }, { once: true });

  // Keep restoration disabled through the entire load; some browsers restore
  // position after pageshow. Enable it when leaving so Back can restore this page.
  window.addEventListener("pagehide", () => {
    if ("scrollRestoration" in history) history.scrollRestoration = "auto";
  });
})();
