export function createSettingsEditor({
  config,
  defaults,
  onChange = () => {},
  onReset = () => {}
}) {
  const limits = {
    "view.tilt": [0, 45, 1],
    "view.zoom": [0.6, 2, 0.05],

    "pile.density": [0.3, 3, 0.05],
    "pile.length": [2, 25, 0.5],
    "pile.width": [0.2, 2.5, 0.05],
    "pile.curvature": [0, 1.5, 0.05],
    "pile.variation": [0, 0.9, 0.01],

    "flow.vortexCount": [0, 12, 1],
    "flow.radius": [50, 700, 5],
    "flow.strength": [0, 8, 0.1],
    "flow.speed": [0, 2, 0.01],
    "flow.wandering": [0, 0.5, 0.01],
    "flow.direction": [-180, 180, 1],

    "lighting.direction": [-180, 180, 1],
    "lighting.strength": [0, 3, 0.05],
    "lighting.sharpness": [1, 16, 0.5],

    "iridescence.strength": [0, 1, 0.01],
    "iridescence.frequency": [0.25, 6, 0.05],

    "movingLights.strength": [0, 2, 0.05],
    "movingLights.speed": [0, 2, 0.01],

    "folds.height": [0, 0.22, 0.005],
    "folds.scale": [0.3, 1.8, 0.05],
    "folds.speed": [0, 1, 0.01],

    "shadows.strength": [0, 1, 0.01],

    "turbulence.strength": [0, 2, 0.05],
    "turbulence.scale": [0.2, 3, 0.05],

    "breathing.strength": [0, 0.7, 0.01],
    "breathing.speed": [0, 3, 0.05],

    "shimmer.strength": [0, 1, 0.01],
    "shimmer.speed": [0, 3, 0.05],
    "shimmer.width": [0.03, 0.8, 0.01],

    "brush.radius": [20, 350, 5],
    "brush.strength": [0, 2, 0.05],
    "brush.persistence": [0.2, 15, 0.1],

    "ripples.strength": [0, 2, 0.05],
    "ripples.speed": [20, 350, 5],
    "ripples.lifetime": [1, 12, 0.25],

    "whirlpool.radius": [30, 450, 5],
    "whirlpool.strength": [0, 8, 0.1],

    "parallax.strength": [0, 0.4, 0.01],
    "parallax.smoothing": [0.5, 15, 0.5],

    "dust.density": [0, 1, 0.01],
    "dust.brightness": [0, 2, 0.05],
    "dust.speed": [0, 2, 0.05],

    "bloom.strength": [0, 2, 0.05],
    "bloom.threshold": [0, 2, 0.05],
    "bloom.radius": [0.5, 6, 0.25],

    "appearance.exposure": [0.2, 3, 0.05],
    "quality.pixelRatio": [0.5, 2, 0.25],
    "animation.speed": [0, 3, 0.05]
  };

  const sectionNames = {
    view: "View and camera",
    pile: "Dense velvet pile",
    flow: "Vortex flow",
    lighting: "Anisotropic lighting",
    iridescence: "Iridescent sheen",
    movingLights: "Moving light sources",
    folds: "Fabric folds",
    shadows: "Fiber and fold shadows",
    turbulence: "Layered curl turbulence",
    breathing: "Breathing vortices",
    shimmer: "Traveling shimmer waves",
    brush: "Pressure brushing",
    ripples: "Click ripples",
    whirlpool: "Interactive whirlpool",
    parallax: "Depth and parallax",
    dust: "Floating lint and dust",
    bloom: "Selective bloom",
    appearance: "Colors and appearance",
    quality: "Rendering quality",
    animation: "Animation",
    panel: "Settings editor"
  };

  const labels = {
    "view.threeD": "3D surface",
    "view.perspective": "Perspective projection",
    "pile.enabled": "Dense curved fibers",
    "brush.pressure": "Speed-sensitive pressure",
    "quality.pixelRatio": "Maximum pixel ratio"
  };

  const sectionHelp = {
    view:
      "Choose a flat or displaced fabric surface and a perspective or " +
      "orthographic camera.",
    pile:
      "Fine curved fibers create the plush surface. Their visible length " +
      "is limited by spacing to keep the procedural weave continuous.",
    flow:
      "Wandering vortices determine which direction the fibers lean.",
    lighting:
      "Silky highlights follow the fiber direction and fabric normal.",
    iridescence:
      "Adds restrained color shifts as the fiber direction changes.",
    movingLights:
      "Broad moving pools of light reveal the fabric's flow.",
    folds:
      "A shared animated height field bends the fabric. In 3D it also " +
      "changes the visible surface position.",
    shadows:
      "Approximate shading between fibers and behind raised folds.",
    turbulence:
      "Several smoothly changing scales of eddies enrich the main flow.",
    breathing:
      "Vortices slowly change radius and strength.",
    shimmer:
      "A traveling band of light sweeps across the fibers.",
    brush:
      "Move the pointer across the fabric to leave directional tracks. " +
      "Tracks recover gradually.",
    ripples:
      "Click or tap to send a circular disturbance through the pile.",
    whirlpool:
      "Hold the primary pointer button to twist nearby fibers.",
    parallax:
      "Pointer movement gently shifts the 3D viewpoint.",
    dust:
      "Sparse drifting particles become visible in moving light bands.",
    bloom:
      "An analytic soft halo surrounds fiber highlights above the " +
      "brightness threshold.",
    appearance:
      "Choose the underlying fabric colors and overall exposure.",
    quality:
      "Lower the maximum pixel ratio if rendering is too expensive.",
    animation:
      "Control ambient motion. Brushing remains interactive while paused.",
    panel:
      "Control whether the settings editor is available."
  };

  const help = {
    "view.threeD":
      "On: folds displace the surface and camera tilt is enabled. " +
      "Off: the camera faces a flat surface.",
    "view.perspective":
      "On: distant fabric appears smaller. Off: parallel orthographic " +
      "projection keeps scale constant with depth.",
    "view.tilt":
      "Camera tilt in degrees. Applies in 3D mode.",
    "view.zoom":
      "Magnification. The infinite fabric field continues covering the screen.",

    "pile.density":
      "Higher values reduce fiber spacing and create a denser pile.",
    "pile.length":
      "Target fiber length in fabric units. Very long fibers are limited " +
      "relative to their spacing.",
    "pile.width":
      "Thickness of each soft fiber.",
    "pile.curvature":
      "Amount of bend along individual fibers.",
    "pile.variation":
      "Random variation in fiber length.",

    "flow.vortexCount":
      "Number of ambient vortices, up to twelve.",
    "flow.radius":
      "Approximate reach of each vortex in fabric units.",
    "flow.strength":
      "How strongly vortices turn fibers away from the base direction.",
    "flow.speed":
      "Speed of ambient vortex wandering and turbulence.",
    "flow.wandering":
      "How far vortex centers travel from their starting positions.",
    "flow.direction":
      "Base fiber direction in degrees.",

    "lighting.direction":
      "Direction of the main light across the fabric.",
    "lighting.strength":
      "Brightness of directional silky highlights.",
    "lighting.sharpness":
      "Higher values create narrower directional highlights.",

    "iridescence.strength":
      "How much the iridescent colors influence the fabric.",
    "iridescence.frequency":
      "How rapidly the sheen changes color as fibers turn.",

    "movingLights.strength":
      "Brightness of the moving light pools.",
    "movingLights.speed":
      "Travel speed of the moving light pools.",

    "folds.height":
      "Height of broad fabric folds.",
    "folds.scale":
      "Higher values create more closely spaced folds.",
    "folds.speed":
      "Speed of the folds' slow movement.",

    "shadows.strength":
      "Depth of the approximate fiber and fold shading.",

    "turbulence.strength":
      "How strongly small eddies bend the fiber flow.",
    "turbulence.scale":
      "Higher values create smaller eddies.",

    "breathing.strength":
      "How much vortex size and strength vary.",
    "breathing.speed":
      "Speed of the breathing cycle.",

    "shimmer.strength":
      "Brightness of the traveling shimmer.",
    "shimmer.speed":
      "Speed of the traveling shimmer.",
    "shimmer.width":
      "Width of the illuminated band.",

    "brush.radius":
      "Width of the pointer's brushing influence.",
    "brush.strength":
      "How strongly brushing redirects and darkens the pile.",
    "brush.persistence":
      "Track half-life in seconds. Higher values retain tracks longer.",
    "brush.pressure":
      "Faster pointer motion leaves broader, stronger tracks.",

    "ripples.strength":
      "How strongly click ripples bend and illuminate fibers.",
    "ripples.speed":
      "Outward speed of each ripple in fabric units per second.",
    "ripples.lifetime":
      "How many animation seconds a ripple remains visible.",

    "whirlpool.radius":
      "Reach of the vortex created while holding the pointer.",
    "whirlpool.strength":
      "Strength of the held vortex. It releases gradually.",

    "parallax.strength":
      "Amount of pointer-driven viewpoint movement in 3D.",
    "parallax.smoothing":
      "Higher values make the viewpoint follow the pointer faster.",

    "dust.density":
      "Proportion of procedural particle cells containing dust.",
    "dust.brightness":
      "Brightness of dust when it crosses a light band.",
    "dust.speed":
      "Drift speed of dust and lint.",

    "bloom.strength":
      "Intensity of the soft highlight halo.",
    "bloom.threshold":
      "Only highlights above this value produce a halo.",
    "bloom.radius":
      "Softness and reach of the analytic fiber halo.",

    "appearance.backgroundColor":
      "Dark color visible beneath the velvet pile.",
    "appearance.colorA":
      "First main fabric color.",
    "appearance.colorB":
      "Second main fabric color.",
    "appearance.highlightColor":
      "Color of highlights, dust, and bloom.",
    "appearance.exposure":
      "Overall brightness before tone mapping.",

    "quality.pixelRatio":
      "Caps rendering resolution relative to CSS pixels. Lower values " +
      "reduce GPU work substantially.",

    "animation.speed":
      "Multiplier for ambient motion and ripple time.",
    "animation.paused":
      "Freeze ambient animation. Pointer brushing and camera interaction " +
      "remain available.",
    "animation.respectReducedMotion":
      "Freeze ambient motion when the operating system requests reduced motion.",

    "panel.enabled":
      "Hide the editor, including its Settings button. Reload the page to " +
      "restore it. Copy your configuration first."
  };

  const style = document.createElement("style");
  style.textContent = `
    .velvet-editor {
      position: fixed;
      inset: 0;
      z-index: 10000;
      pointer-events: none;
      color: #eee7f7;
      color-scheme: dark;
      font: 13px/1.5 system-ui, sans-serif;
    }

    .velvet-editor * {
      box-sizing: border-box;
    }

    .velvet-editor [hidden] {
      display: none !important;
    }

    .velvet-editor button,
    .velvet-editor input,
    .velvet-editor textarea {
      font: inherit;
    }

    .velvet-editor button {
      padding: 8px 11px;
      border: 1px solid #ffffff25;
      border-radius: 7px;
      background: #30283e;
      color: inherit;
      cursor: pointer;
    }

    .velvet-editor button:hover {
      background: #463854;
    }

    .velvet-editor :focus-visible {
      outline: 2px solid #cab1ed;
      outline-offset: 3px;
    }

    .velvet-toggle {
      position: absolute;
      top: 16px;
      right: 16px;
      pointer-events: auto;
    }

    .velvet-panel {
      position: absolute;
      top: 0;
      right: 0;
      width: min(370px, 100vw);
      height: 100%;
      overflow: auto;
      padding: 20px;
      border-left: 1px solid #ffffff20;
      background: rgba(17, 13, 27, 0.95);
      backdrop-filter: blur(16px);
      pointer-events: auto;
      transform: translateX(100%);
      transition: transform 200ms ease;
    }

    .velvet-panel.open {
      transform: translateX(0);
    }

    .velvet-heading,
    .velvet-control-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .velvet-heading h2 {
      margin: 0;
      font-size: 18px;
    }

    .velvet-description,
    .velvet-status,
    .velvet-count {
      color: #bcaecb;
      font-size: 12px;
    }

    .velvet-search {
      position: sticky;
      top: -20px;
      z-index: 2;
      margin: 0 -4px 12px;
      padding: 12px 4px 10px;
      background: #15101f;
    }

    .velvet-search input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ffffff30;
      border-radius: 8px;
      background: #ffffff08;
      color: inherit;
    }

    .velvet-count {
      margin-top: 5px;
      min-height: 18px;
    }

    .velvet-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      margin: 12px 0;
    }

    .velvet-section {
      margin: 0 0 10px;
      border: 1px solid #ffffff15;
      border-radius: 9px;
      background: #ffffff03;
    }

    .velvet-section summary {
      padding: 12px;
      color: #d3bdea;
      font-weight: 600;
      cursor: pointer;
    }

    .velvet-section[open] summary {
      border-bottom: 1px solid #ffffff12;
    }

    .velvet-section-body {
      padding: 12px;
    }

    .velvet-control {
      margin: 0 0 15px;
    }

    .velvet-control:last-child {
      margin-bottom: 0;
    }

    .velvet-control-title {
      margin-bottom: 6px;
    }

    .velvet-control label {
      cursor: help;
    }

    .velvet-panel input[type="range"] {
      width: 100%;
      accent-color: #bea2e0;
    }

    .velvet-panel input[type="number"] {
      width: 78px;
      padding: 4px 6px;
      border: 1px solid #ffffff25;
      border-radius: 5px;
      background: #ffffff08;
      color: inherit;
    }

    .velvet-panel input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: #bea2e0;
    }

    .velvet-panel input[type="color"] {
      width: 60px;
      height: 32px;
      padding: 2px;
      border: 1px solid #ffffff25;
      border-radius: 5px;
      background: transparent;
    }

    .velvet-code {
      width: 100%;
      min-height: 280px;
      padding: 12px;
      resize: vertical;
      border: 1px solid #ffffff25;
      border-radius: 8px;
      background: #0b0812;
      color: #dfd1ed;
      font: 11px/1.6 ui-monospace, monospace !important;
    }

    .velvet-status {
      min-height: 20px;
    }

    .velvet-tooltip {
      position: fixed;
      z-index: 10002;
      width: 265px;
      max-width: calc(100vw - 24px);
      padding: 12px;
      border: 1px solid #bca0de55;
      border-radius: 9px;
      background: #21182e;
      box-shadow: 0 10px 35px #0007;
      color: #eee5f8;
      pointer-events: none;
      font-size: 12px;
    }

    @media (prefers-reduced-motion: reduce) {
      .velvet-panel {
        transition: none;
      }
    }
  `;
  document.head.append(style);

  const root = document.createElement("div");
  root.className = "velvet-editor";
  root.dataset.backgroundEditor = "";

  root.innerHTML = `
    <button
      class="velvet-toggle"
      type="button"
      aria-controls="velvet-settings-panel"
      aria-expanded="false"
    >Settings</button>

    <aside
      id="velvet-settings-panel"
      class="velvet-panel"
      aria-label="Velvet Vortices settings"
      inert
    >
      <div class="velvet-heading">
        <h2>Velvet Vortices</h2>
        <button class="velvet-close" type="button">Retract</button>
      </div>

      <p class="velvet-description">
        Move to brush. Click for ripples. Hold to create a whirlpool.
        Hover over a setting for help.
      </p>

      <div class="velvet-search">
        <input
          type="search"
          placeholder="Search settings…"
          aria-label="Search settings"
          autocomplete="off"
        >
        <div class="velvet-count" aria-live="polite"></div>
      </div>

      <div class="velvet-actions">
        <button class="velvet-expand" type="button">Expand all</button>
        <button class="velvet-collapse" type="button">Collapse all</button>
      </div>

      <div class="velvet-controls"></div>

      <p class="velvet-empty" hidden>No matching settings.</p>

      <div class="velvet-actions">
        <button class="velvet-show" type="button">Show code</button>
        <button class="velvet-copy" type="button">Copy settings</button>
        <button class="velvet-weave" type="button">New weave</button>
        <button class="velvet-reset" type="button">Reset defaults</button>
      </div>

      <textarea
        class="velvet-code"
        aria-label="Configuration code"
        readonly
        spellcheck="false"
        hidden
      ></textarea>

      <div class="velvet-status" role="status" aria-live="polite"></div>
    </aside>

    <div
      class="velvet-tooltip"
      id="velvet-tooltip"
      role="tooltip"
      hidden
    ></div>
  `;

  document.body.append(root);

  const $ = selector => root.querySelector(selector);
  const toggle = $(".velvet-toggle");
  const panel = $(".velvet-panel");
  const close = $(".velvet-close");
  const controls = $(".velvet-controls");
  const search = $(".velvet-search input");
  const count = $(".velvet-count");
  const empty = $(".velvet-empty");
  const code = $(".velvet-code");
  const show = $(".velvet-show");
  const status = $(".velvet-status");
  const tooltip = $(".velvet-tooltip");

  const sections = [];
  const refreshers = [];
  let previousOpenState = null;

  function title(value) {
    return value
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, letter => letter.toUpperCase());
  }

  function element(tag, className) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function exportCode() {
    return `const defaults = ${JSON.stringify(config, null, 2)};`;
  }

  function changed() {
    code.value = exportCode();
    onChange();

    if (!config.panel.enabled) {
      setOpen(false);
      root.hidden = true;
    }
  }

  function setOpen(open) {
    tooltip.hidden = true;
    toggle.hidden = false;

    if (!open && panel.contains(document.activeElement)) {
      toggle.focus();
    }

    panel.classList.toggle("open", open);
    panel.inert = !open;
    toggle.hidden = open;
    toggle.setAttribute("aria-expanded", String(open));

    if (open) search.focus();
  }

  function showTooltip(container, text) {
    if (!panel.classList.contains("open")) return;

    tooltip.textContent = text;
    tooltip.hidden = false;

    const row = container.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const box = tooltip.getBoundingClientRect();

    // Prefer the requested position to the left of the settings pane.
    const left = panelRect.left - box.width - 12;

    tooltip.style.left = `${Math.max(
      12,
      Math.min(left, innerWidth - box.width - 12)
    )}px`;

    tooltip.style.top = `${Math.max(
      12,
      Math.min(row.top, innerHeight - box.height - 12)
    )}px`;
  }

  function attachHelp(container, text) {
    container.addEventListener("pointerenter", () => {
      showTooltip(container, text);
    });

    container.addEventListener("pointerleave", () => {
      tooltip.hidden = true;
    });

    container.addEventListener("focusin", () => {
      showTooltip(container, text);
    });

    container.addEventListener("focusout", event => {
      if (!container.contains(event.relatedTarget)) {
        tooltip.hidden = true;
      }
    });
  }

  function toHex(color) {
    return "#" + color.map(channel =>
      Math.round(channel).toString(16).padStart(2, "0")
    ).join("");
  }

  for (const [sectionName, group] of Object.entries(config)) {
    const details = element("details", "velvet-section");
    const summary = element("summary");
    const body = element("div", "velvet-section-body");
    const rows = [];

    summary.textContent = sectionNames[sectionName] || title(sectionName);
    details.open = ["view", "pile"].includes(sectionName);
    details.append(summary, body);
    controls.append(details);

    for (const [key, initialValue] of Object.entries(group)) {
      const path = `${sectionName}.${key}`;
      const labelText = labels[path] || title(key);
      const description = help[path] || (
        key === "enabled"
          ? `Enable or disable ${summary.textContent.toLowerCase()}. ` +
            (sectionHelp[sectionName] || "")
          : sectionHelp[sectionName] || labelText
      );

      const container = element("div", "velvet-control");
      const heading = element("div", "velvet-control-title");
      const label = element("label");
      const id = `velvet-${sectionName}-${key}`;

      label.textContent = labelText;
      label.htmlFor = id;
      heading.append(label);
      container.append(heading);

      attachHelp(container, description);

      if (typeof initialValue === "boolean") {
        const input = element("input");
        input.type = "checkbox";
        input.id = id;
        input.checked = initialValue;
        input.setAttribute("aria-describedby", "velvet-tooltip");

        input.addEventListener("change", () => {
          config[sectionName][key] = input.checked;
          changed();
        });

        heading.append(input);

        refreshers.push(() => {
          input.checked = config[sectionName][key];
        });
      } else if (Array.isArray(initialValue)) {
        const input = element("input");
        input.type = "color";
        input.id = id;
        input.value = toHex(initialValue);
        input.setAttribute("aria-describedby", "velvet-tooltip");

        input.addEventListener("input", () => {
          config[sectionName][key] = [1, 3, 5].map(offset =>
            parseInt(input.value.slice(offset, offset + 2), 16)
          );
          changed();
        });

        heading.append(input);

        refreshers.push(() => {
          input.value = toHex(config[sectionName][key]);
        });
      } else if (typeof initialValue === "number") {
        const [min, max, step] = limits[path] || [0, 10, 0.1];
        const number = element("input");
        const range = element("input");

        number.type = "number";
        number.id = id;
        range.type = "range";
        range.setAttribute("aria-label", labelText);

        for (const input of [number, range]) {
          input.min = String(min);
          input.max = String(max);
          input.step = String(step);
          input.value = String(initialValue);
          input.setAttribute("aria-describedby", "velvet-tooltip");

          input.addEventListener("input", () => {
            if (input.value === "") return;

            const parsed = Number(input.value);
            if (!Number.isFinite(parsed)) return;

            const bounded = Math.max(min, Math.min(max, parsed));
            const stepped = min + Math.round((bounded - min) / step) * step;
            const value = Number(
              Math.max(min, Math.min(max, stepped)).toFixed(6)
            );

            config[sectionName][key] = value;

            if (input === number) range.value = String(value);
            else number.value = String(value);

            changed();
          });

          input.addEventListener("change", () => {
            input.value = String(config[sectionName][key]);
          });

          input.addEventListener("blur", () => {
            input.value = String(config[sectionName][key]);
          });
        }

        heading.append(number);
        container.append(range);

        refreshers.push(() => {
          const value = String(config[sectionName][key]);
          number.value = value;
          range.value = value;
        });
      }

      body.append(container);

      rows.push({
        container,
        text: [
          sectionName,
          summary.textContent,
          key,
          labelText,
          description,
          path
        ].join(" ").toLowerCase()
      });
    }

    sections.push({ details, rows });
  }

  function filterSettings() {
    const query = search.value.trim().toLowerCase();
    const terms = query.split(/\s+/).filter(Boolean);

    tooltip.hidden = true;

    if (query && previousOpenState === null) {
      previousOpenState = sections.map(section => section.details.open);
    }

    let matches = 0;

    sections.forEach((section, index) => {
      let visible = 0;

      for (const row of section.rows) {
        const match = terms.every(term => row.text.includes(term));
        row.container.hidden = !match;
        if (match) visible++;
      }

      section.details.hidden = visible === 0;

      if (query && visible > 0) {
        section.details.open = true;
      } else if (!query && previousOpenState !== null) {
        section.details.open = previousOpenState[index];
      }

      matches += visible;
    });

    if (!query) previousOpenState = null;

    empty.hidden = matches > 0;
    count.textContent = query
      ? `${matches} matching setting${matches === 1 ? "" : "s"}`
      : "Search names, sections, or descriptions.";
  }

  search.addEventListener("input", filterSettings);

  $(".velvet-expand").addEventListener("click", () => {
    sections.forEach(({ details }) => {
      if (!details.hidden) details.open = true;
    });
  });

  $(".velvet-collapse").addEventListener("click", () => {
    sections.forEach(({ details }) => {
      if (!details.hidden) details.open = false;
    });
  });

  toggle.addEventListener("click", () => setOpen(true));
  close.addEventListener("click", () => setOpen(false));

  show.addEventListener("click", () => {
    code.hidden = !code.hidden;
    code.value = exportCode();
    show.textContent = code.hidden ? "Show code" : "Hide code";
  });

  $(".velvet-copy").addEventListener("click", async () => {
    code.value = exportCode();

    try {
      await navigator.clipboard.writeText(code.value);
      status.textContent = "Settings copied as const defaults.";
    } catch {
      code.hidden = false;
      show.textContent = "Hide code";
      code.focus();
      code.select();
      status.textContent = "Press Ctrl+C or ⌘C to copy.";
    }
  });

  $(".velvet-weave").addEventListener("click", () => {
    onReset();
    status.textContent = "A new weave has been generated.";
  });

  $(".velvet-reset").addEventListener("click", () => {
    for (const sectionName of Object.keys(config)) {
      for (const key of Object.keys(config[sectionName])) {
        config[sectionName][key] =
          structuredClone(defaults[sectionName][key]);
      }
    }

    refreshers.forEach(refresh => refresh());
    onReset();
    changed();
    filterSettings();

    status.textContent = "Default settings restored.";
  });

  function onKeyDown(event) {
    if (
      event.key === "Escape" &&
      panel.classList.contains("open")
    ) {
      if (search.value) {
        search.value = "";
        filterSettings();
        search.focus();
      } else {
        setOpen(false);
      }
    }
  }

  function hideTooltip() {
    tooltip.hidden = true;
  }

  document.addEventListener("keydown", onKeyDown);
  panel.addEventListener("scroll", hideTooltip);
  window.addEventListener("resize", hideTooltip);

  code.value = exportCode();
  filterSettings();

  return {
    destroy() {
      document.removeEventListener("keydown", onKeyDown);
      panel.removeEventListener("scroll", hideTooltip);
      window.removeEventListener("resize", hideTooltip);
      root.remove();
      style.remove();
    }
  };
}