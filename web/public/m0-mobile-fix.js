(() => {
  const MOBILE_QUERY = "(max-width: 720px)";
  const STYLE_ID = "m0-mobile-safe-top-style";

  function isM0() {
    return Boolean(document.querySelector(".m0-demo-bar"));
  }

  function ensureStyle() {
    if (!isM0() || document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      @media (max-width: 720px) {
        /* Reserve real viewport space for the fixed M0 bar. This deliberately
           avoids changing the OpenTakeoff canvas/rail positioning rules. */
        .m0-demo-bar + * {
          margin-top: 42px !important;
        }

        /* Keep the original upper OpenTakeoff toolbar interactive and above
           normal canvas content, but below the M0 shell bar. */
        .m0-demo-bar + * button,
        .m0-demo-bar + * input,
        .m0-demo-bar + * select,
        .m0-demo-bar + * [role="button"] {
          pointer-events: auto;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function translateValue(value) {
    if (!value) return value;
    let next = String(value);
    next = next
      .replace(/drag conditions here\s*\(or pin a row\)\s*for 1[–-]9 one-click access/gi,
        "Húzd ide a mérési tételeket (vagy rögzíts egy sort) az 1–9 gyorseléréshez")
      .replace(/\+\s*condition\b/gi, "+ mérési tétel")
      .replace(/^condition$/i, "Mérési tétel")
      .replace(/^conditions$/i, "Mérési tételek");
    return next;
  }

  function translateNode(root) {
    if (!isM0() || !root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      const next = translateValue(root.nodeValue);
      if (next !== root.nodeValue) root.nodeValue = next;
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root !== document.body) return;

    const elements = root.matches?.("[title],[aria-label],[placeholder]") ? [root] : [];
    root.querySelectorAll?.("[title],[aria-label],[placeholder]").forEach((el) => elements.push(el));
    for (const el of elements) {
      for (const attr of ["title", "aria-label", "placeholder"]) {
        const value = el.getAttribute(attr);
        if (!value) continue;
        const next = translateValue(value);
        if (next !== value) el.setAttribute(attr, next);
      }
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const next = translateValue(node.nodeValue);
      if (next !== node.nodeValue) node.nodeValue = next;
    }
  }

  function refresh() {
    if (!isM0()) return;
    ensureStyle();
    translateNode(document.body);
  }

  function start() {
    // React mounts after this deferred script. Poll briefly until the M0 shell
    // exists, then MutationObserver keeps dynamic condition text translated.
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (isM0()) {
        window.clearInterval(timer);
        refresh();
        const observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (mutation.type === "characterData") translateNode(mutation.target);
            for (const node of mutation.addedNodes || []) translateNode(node);
          }
          ensureStyle();
        });
        observer.observe(document.body, { subtree: true, childList: true, characterData: true });
        window.addEventListener("resize", ensureStyle, { passive: true });
      } else if (attempts >= 100) {
        window.clearInterval(timer);
      }
    }, 50);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
