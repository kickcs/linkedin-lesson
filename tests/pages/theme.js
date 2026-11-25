// The engine under a brand theme: palette, font roles, roughness, page background
(async () => {
  const S = window.Sketch, K = window.Scene;
  await document.fonts.load('400 16px "Theme Sans"').catch(() => {});
  check("theme colors override the palette, the rest stays", () => { eq(S.C.field, "#112233"); eq(S.C.ink, "#010203"); eq(S.C.paper, "#ffffff"); });
  check("scene colors come from the palette", () => eq(K.lgreen, "#00ff00"));
  check("a theme font replaces only its role", () => { eq(S.SANS, "Theme Sans"); eq(S.HAND, "Shantell Sans"); ok(S.MONO.startsWith('"JetBrains Mono"'), S.MONO); });
  check("the theme font loads from fonts/ next to sketch.js", () =>
    ok([...document.fonts].some((f) => f.family.replace(/"/g, "") === "Theme Sans" && f.status === "loaded"), "Theme Sans did not load"));
  check("rough scales roughness and bowing of every stroke", () => {
    const s = S.stage(S.el("svg", {}, document.body), {});
    eq(S.o(s, { roughness: 1 }).roughness, 0.5);
    eq(S.o(s, {}).bowing, 0.25);
  });
  check("the field color reaches the page background", () => eq(getComputedStyle(document.documentElement).getPropertyValue("--field").trim(), "#112233"));
  done();
})();
