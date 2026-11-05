export function createSettingsEditor({
  config,
  onChange = () => {},
  onReset = () => {}
}) {
  const featureInfo = {
    duneDepth: ["3D Dune Beds", "Project the dune layers and lift airborne grains above the beds."],
    avalanches: ["Crest Avalanches", "Slide sheets of grains downhill from steep crests."],
    plumes: ["Turbulent Plumes", "Curl suspended grains and leave eddies in the pointer's wake."],
    glints: ["Mineral Glints", "Catch grazing light on individual mineral flecks."],
    strata: ["Buried Strata", "Reveal mineral seams where the bed erodes."],
    caustics: ["Underwater Caustics", "Sweep refracted light across dunes and suspended grains."],
    deposition: ["Deposition Afterglow", "Leave fading light at grain landing sites."],
    sorting: ["Grain-Size Sorting", "Keep fine dust aloft while coarse grains fall faster."],
    shadows: ["Dune Shadows", "Shade troughs behind nearby crests."],
    bloom: ["Selective Bloom", "Spread a soft halo around bright highlights."]
  };

  const original = structuredClone(config);
  const presets = {
    "Original": {},
    "Deep Current": {
      appearance: { backgroundColor: [4, 13, 27], colorA: [53, 166, 199], colorB: [93, 223, 183] },
      features: {
        duneDepth: { enabled: true },
        caustics: { enabled: true, contrast: 0.75 },
        plumes: { enabled: true, strength: 145 },
        shadows: { enabled: true, strength: 0.5 }
      }
    },
    "Copper Escarpment": {
      appearance: { backgroundColor: [18, 10, 14], colorA: [227, 106, 55], colorB: [250, 191, 115] },
      features: {
        avalanches: { enabled: true, density: 1.1 },
        strata: { enabled: true },
        glints: { enabled: true },
        shadows: { enabled: true }
      }
    },
    "Bioluminescent Drift": {
      appearance: { backgroundColor: [8, 8, 24], colorA: [87, 114, 231], colorB: [84, 217, 206] },
      physics: { erosion: 0.1 },
      features: {
        plumes: { enabled: true },
        sorting: { enabled: true },
        deposition: { enabled: true, decay: 3.5 },
        bloom: { enabled: true, intensity: 1.1 }
      }
    }
  };

  const featureLimits = {
    duneDepth: { tilt: [0, 55, 1], spacing: [0.1, 1.4, 0.05], zoom: [1, 1.45, 0.01] },
    avalanches: { slope: [0.1, 2.5, 0.05], density: [0, 3, 0.05], speed: [10, 220, 1] },
    plumes: { strength: [0, 260, 1], size: [30, 300, 1], wake: [0.25, 4, 0.05] },
    glints: { density: [0, 1, 0.01], intensity: [0, 4, 0.05], angle: [-180, 180, 1] },
    strata: { spacing: [3, 28, 1], thickness: [0.25, 4, 0.05], exposure: [0, 1, 0.01] },
    caustics: { scale: [25, 300, 1], speed: [0, 2, 0.01], contrast: [0, 1.5, 0.01] },
    deposition: { brightness: [0, 2, 0.02], spread: [1, 28, 1], decay: [0.2, 8, 0.1] },
    sorting: { fineRatio: [0, 1, 0.01], contrast: [0, 2.4, 0.05], spread: [0, 1.3, 0.05] },
    shadows: { angle: [-80, 80, 1], strength: [0, 1, 0.01], softness: [0, 1, 0.01] },
    bloom: { threshold: [0.1, 1.4, 0.01], radius: [1, 16, 0.25], intensity: [0, 2.5, 0.05] }
  };

  const limits = {
    "grains.count": [100, 6000, 100],
    "grains.size": [0.3, 4, 0.1],
    "grains.sizeVariation": [0, 0.9, 0.01],
    "grains.opacity": [0, 1, 0.01],
    "grains.glow": [0, 15, 0.5],

    "dunes.layers": [1, 10, 1],
    "dunes.height": [0, 150, 1],
    "dunes.wavelength": [100, 1000, 1],
    "dunes.thickness": [1, 100, 1],
    "dunes.movement": [0, 1, 0.01],
    "dunes.contourOpacity": [0, 0.5, 0.01],

    "physics.settlingSpeed": [5, 200, 1],
    "physics.gravity": [5, 150, 1],
    "physics.drag": [0.1, 6, 0.1],
    "physics.erosion": [0, 0.5, 0.005],
    "physics.erosionLift": [0, 200, 1],
    "physics.current": [0, 100, 1],

    "mouse.radius": [30, 400, 1],
    "mouse.liftStrength": [0, 500, 1],
    "mouse.scatterStrength": [0, 300, 1],
    "mouse.smoothing": [0.5, 20, 0.1],

    "animation.speed": [0, 3, 0.05]
  };

  const helpText = {
    "grains.count": "Number of simulated grains.",
    "grains.size": "Radius of a full-sized grain in CSS pixels.",
    "grains.sizeVariation": "How much smaller individual grains can be.",
    "grains.opacity": "Brightness of the grain cores and their halos.",
    "grains.glow": "Extra radius of each grain halo.",
    "dunes.layers": "Number of sediment beds.",
    "dunes.height": "Vertical amplitude of the dune crests.",
    "dunes.wavelength": "Horizontal distance between the main crests.",
    "dunes.thickness": "Vertical spread of settled grains around each bed.",
    "dunes.movement": "Drift speed of the bed profiles.",
    "dunes.showContours": "Draw the centerline of each dune bed.",
    "dunes.contourOpacity": "Strength of the dune centerlines.",
    "physics.settlingSpeed": "Maximum falling speed of a suspended grain.",
    "physics.gravity": "Downward acceleration while airborne.",
    "physics.drag": "How quickly grains approach the local current.",
    "physics.erosion": "Chance per second for settled grains to lift naturally.",
    "physics.erosionLift": "Initial vertical speed of eroded grains.",
    "physics.current": "Speed of horizontal drift in suspension.",
    "mouse.enabled": "Let the pointer lift and scatter nearby grains.",
    "mouse.radius": "Radius of the pointer's influence in CSS pixels.",
    "mouse.liftStrength": "Upward force near the pointer.",
    "mouse.scatterStrength": "Horizontal push away from the pointer.",
    "mouse.smoothing": "How quickly the interaction follows the pointer.",
    "mouse.showHalo": "Show a faint halo around the affected area.",
    "appearance.backgroundColor": "Color behind the dune beds.",
    "appearance.colorA": "Grain tint toward the back of the field.",
    "appearance.colorB": "Grain tint toward the front of the field.",
    "appearance.highlightColor": "Highlight tint for grains, glow, and the pointer.",
    "animation.speed": "Time multiplier for dune movement and simulation.",
    "animation.paused": "Freeze the simulation and animated lighting.",
    "animation.respectReducedMotion": "Start still when the system requests reduced motion.",
    "panel.enabled": "Show the editor on load when this config is pasted into the page.",
    "duneDepth.projection": "Perspective shrinks distant beds. Orthographic keeps their scale uniform.",
    "duneDepth.tilt": "Angle of the fixed view across the dune layers.",
    "duneDepth.spacing": "Depth separation between layers.",
    "duneDepth.zoom": "Magnification of the projected view.",
    "avalanches.slope": "Minimum steepness needed to start a slide.",
    "avalanches.density": "Frequency of releases on qualifying slopes.",
    "avalanches.speed": "Downhill speed multiplier.",
    "plumes.strength": "Rotation and drift force on airborne grains.",
    "plumes.size": "Base radius of a pointer eddy.",
    "plumes.wake": "How long a pointer eddy keeps stirring grains, in seconds.",
    "glints.density": "Fraction of grains eligible to flash.",
    "glints.intensity": "Peak brightness of the flashes.",
    "glints.angle": "Light direction used to time the flashes.",
    "strata.spacing": "Distance between the mineral seams.",
    "strata.thickness": "Width of each exposed seam.",
    "strata.exposure": "Strength of the mineral colors as the bed erodes.",
    "strata.colorA": "First mineral seam color.",
    "strata.colorB": "Second mineral seam color.",
    "caustics.scale": "Width and spacing of the refracted light pattern.",
    "caustics.speed": "Drift speed of the light pattern.",
    "caustics.contrast": "Brightness of the caustic highlights.",
    "deposition.brightness": "Peak intensity of accumulated landing traces.",
    "deposition.spread": "Width of the landing glow around each bed.",
    "deposition.decay": "Time constant of the glow fade, in seconds.",
    "sorting.fineRatio": "Fraction of grains treated as fine dust.",
    "sorting.contrast": "Difference in settling behavior between fines and coarse grains.",
    "sorting.spread": "Visual size and softness difference between the two groups.",
    "shadows.angle": "Signed light angle. The sign switches the side of illumination.",
    "shadows.strength": "How much crest shadows darken the troughs.",
    "shadows.softness": "How gradually shadows fade near their edges.",
    "bloom.threshold": "Minimum highlight brightness that contributes to bloom.",
    "bloom.radius": "Distance the highlight halo spreads.",
    "bloom.intensity": "Brightness of the final bloom pass."
  };

  const style = document.createElement("style");

  style.textContent = `
    .sediment-editor [hidden] { display: none !important; }
    .sediment-editor details { margin: 8px 0; border: 1px solid #ffffff24; border-radius: 8px; padding: 8px; }
    .sediment-editor summary { cursor: pointer; font-weight: 650; }
    .sediment-editor .sediment-search, .sediment-editor select {
      width: 100%; padding: 7px; color: inherit; background: #182630;
      border: 1px solid #ffffff36; border-radius: 6px; font: inherit;
    }
    .sediment-editor .sediment-feature { padding: 3px 6px; }
    .sediment-help {
      position: fixed; z-index: 10001; max-width: 220px; padding: 8px 10px;
      border-radius: 6px; border: 1px solid #ffffff35; background: #182630;
      color: #e5edf0; pointer-events: none; box-shadow: 0 5px 18px #0008;
    }
    @media (max-width: 640px) {
      .sediment-help { bottom: 12px; left: 12px; top: auto !important; }
    }
    .sediment-editor {
      position: fixed;
      inset: 0;
      z-index: 10000;
      pointer-events: none;
      color: #e5edf0;
      font: 13px/1.5 system-ui, sans-serif;
      color-scheme: dark;
    }

    .sediment-editor * {
      box-sizing: border-box;
    }

    .sediment-editor button,
    .sediment-editor input,
    .sediment-editor textarea {
      font: inherit;
    }

    .sediment-editor button {
      padding: 8px 11px;
      border: 1px solid #ffffff26;
      border-radius: 7px;
      background: #21313b;
      color: inherit;
      cursor: pointer;
    }

    .sediment-editor button:hover {
      background: #334954;
    }

    .sediment-editor :focus-visible {
      outline: 2px solid #9bd7db;
      outline-offset: 3px;
    }

    .sediment-toggle {
      position: absolute;
      top: 16px;
      right: 16px;
      pointer-events: auto;
    }

    .sediment-panel {
      position: absolute;
      top: 0;
      right: 0;
      width: min(350px, 100vw);
      height: 100%;
      padding: 22px;
      overflow: auto;
      border-left: 1px solid #ffffff20;
      background: rgba(9, 18, 27, 0.94);
      backdrop-filter: blur(16px);
      pointer-events: auto;
      transform: translateX(100%);
      transition: transform 220ms ease;
    }

    .sediment-panel.open {
      transform: translateX(0);
    }

    .sediment-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 8px;
    }

    .sediment-heading h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .sediment-description,
    .sediment-status {
      color: #a5b7c0;
      font-size: 12px;
    }

    .sediment-description {
      margin: 0 0 20px;
    }

    .sediment-panel fieldset {
      min-width: 0;
      margin: 0 0 12px;
      padding: 15px 0 8px;
      border: 0;
      border-top: 1px solid #ffffff18;
    }

    .sediment-panel legend {
      padding-right: 7px;
      color: #add5d8;
      font-weight: 600;
    }

    .sediment-control {
      margin-bottom: 13px;
    }

    .sediment-control-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 6px;
    }

    .sediment-panel input[type="range"] {
      width: 100%;
      accent-color: #97cbd1;
    }

    .sediment-panel input[type="number"] {
      width: 76px;
      padding: 4px 6px;
      border: 1px solid #ffffff24;
      border-radius: 5px;
      background: #ffffff08;
      color: inherit;
    }

    .sediment-panel input[type="checkbox"] {
      accent-color: #97cbd1;
    }

    .sediment-colors {
      display: flex;
      align-items: center;
      gap: 7px;
    }

    .sediment-panel input[type="color"] {
      width: 42px;
      height: 30px;
      padding: 2px;
      border: 1px solid #ffffff24;
      border-radius: 5px;
      background: transparent;
    }

    .sediment-colors input[type="number"] {
      width: 65px;
      min-width: 0;
    }

    .sediment-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }

    .sediment-code {
      width: 100%;
      min-height: 260px;
      margin-top: 14px;
      padding: 12px;
      resize: vertical;
      border: 1px solid #ffffff24;
      border-radius: 7px;
      background: #050d15;
      color: #c6dee5;
      font: 11px/1.6 ui-monospace, monospace !important;
    }

    .sediment-status {
      min-height: 20px;
      margin-top: 10px;
    }

    @media (prefers-reduced-motion: reduce) {
      .sediment-panel {
        transition: none;
      }
    }
  `;

  document.head.append(style);

  const root = document.createElement("div");
  root.className = "sediment-editor";
  root.dataset.backgroundEditor = "";

  root.innerHTML = `
    <button
      class="sediment-toggle"
      type="button"
      aria-expanded="false"
      aria-controls="sediment-settings-panel"
    >Settings</button>

    <aside
      id="sediment-settings-panel"
      class="sediment-panel"
      aria-label="Luminous Sediment settings"
      inert
    >
      <div class="sediment-heading">
        <h2>Luminous Sediment</h2>
        <button class="sediment-close" type="button">Retract</button>
      </div>

      <p class="sediment-description">
        Move your pointer to lift the grains.
        Copy your configuration before disabling the editor.
      </p>

      <input class="sediment-search" type="search" aria-label="Search settings" placeholder="Search settings">
      <details open>
        <summary>Template settings</summary>
        <label>Apply a template
          <select class="sediment-presets"></select>
        </label>
      </details>
      <div class="sediment-controls"></div>
      <p class="sediment-empty" hidden>No settings match your search.</p>

      <div class="sediment-actions">
        <button class="sediment-show" type="button">Show code</button>
        <button class="sediment-copy" type="button">Copy config</button>
        <button class="sediment-reset" type="button">Resettle grains</button>
      </div>

      <textarea
        class="sediment-code"
        aria-label="Configuration code"
        spellcheck="false"
        readonly
        hidden
      ></textarea>

      <div
        class="sediment-status"
        role="status"
        aria-live="polite"
      ></div>
    </aside>
    <div class="sediment-help" hidden></div>
  `;

  document.body.append(root);

  const toggle = root.querySelector(".sediment-toggle");
  const panel = root.querySelector(".sediment-panel");
  const close = root.querySelector(".sediment-close");
  const controls = root.querySelector(".sediment-controls");
  const code = root.querySelector(".sediment-code");
  const show = root.querySelector(".sediment-show");
  const status = root.querySelector(".sediment-status");
  const search = root.querySelector(".sediment-search");
  const presetSelect = root.querySelector(".sediment-presets");
  const help = root.querySelector(".sediment-help");
  const empty = root.querySelector(".sediment-empty");
  const sections = [];
  let presetApplying = false;
  let searching = false;

  presetSelect.add(new Option("Custom", ""));
  for (const name of Object.keys(presets)) presetSelect.add(new Option(name, name));
  presetSelect.value = "Original";

  function title(value) {
    return value
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, letter => letter.toUpperCase());
  }

  function exportCode() {
    return `const config = ${JSON.stringify(config, null, 2)};`;
  }

  function changed() {
    code.value = exportCode();
    onChange();
    if (!presetApplying) presetSelect.value = "";
  }

  function setOpen(open) {
    help.hidden = true;
    toggle.hidden = false;

    if (!open && panel.contains(document.activeElement)) {
      toggle.focus();
    }

    panel.classList.toggle("open", open);
    panel.inert = !open;
    toggle.hidden = open;
    toggle.setAttribute("aria-expanded", String(open));

    if (open) close.focus();
  }

  function element(tag, className) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function toHex(color) {
    return "#" + color.map(value =>
      Math.round(value).toString(16).padStart(2, "0")
    ).join("");
  }

  function makeSection(parent, label, open) {
    const details = element("details");
    const summary = element("summary");
    summary.textContent = label;
    details.append(summary);
    details.open = open;
    parent.append(details);
    return details;
  }

  function buildGroup(details, groupName, group, label, description = "") {
    const body = element("div");
    details.append(body);
    const rows = [];
    const feature = Boolean(description);
    const section = { details, rows, feature, label, description, group, open: details.open };
    sections.push(section);

    for (const [key, value] of Object.entries(group)) {
      const path = `${groupName}.${key}`;
      const container = element("div", "sediment-control");
      const heading = element("div", "sediment-control-title");
      const label = element("label");
      const id = `sediment-${groupName}-${key}`;
      const hint = helpText[path] || description;

      label.textContent = feature && key === "enabled" ? "Enable effect" : title(key);
      label.htmlFor = id;
      heading.append(label);
      container.append(heading);
      if (hint) {
        const displayHelp = () => {
          help.textContent = hint;
          help.style.top = Math.min(container.getBoundingClientRect().top, innerHeight - 100) + "px";
          help.style.right = panel.getBoundingClientRect().width + 10 + "px";
          help.hidden = false;
        };
        container.title = hint;
        container.addEventListener("pointerenter", displayHelp);
        container.addEventListener("pointerleave", () => help.hidden = true);
        container.addEventListener("focusin", displayHelp);
        container.addEventListener("focusout", () => help.hidden = true);
      }

      if (typeof value === "boolean") {
        const input = element("input");

        input.id = id;
        input.type = "checkbox";
        input.checked = value;

        input.addEventListener("change", () => {
          group[key] = input.checked;
          changed();
          if (feature) filterSettings();
        });

        heading.append(input);
      } else if (typeof value === "string") {
        const select = element("select");
        select.id = id;
        for (const option of ["Perspective", "Orthographic"]) select.add(new Option(option));
        select.value = value;
        select.addEventListener("change", () => {
          group[key] = select.value;
          changed();
        });
        container.append(select);
      } else if (Array.isArray(value)) {
        const row = element("div", "sediment-colors");
        const picker = element("input");

        picker.id = id;
        picker.type = "color";
        picker.value = toHex(value);
        row.append(picker);

        const channels = value.map((channel, index) => {
          const input = element("input");

          input.type = "number";
          input.min = 0;
          input.max = 255;
          input.step = 1;
          input.value = channel;

          input.setAttribute(
            "aria-label",
            `${title(key)} ${["red", "green", "blue"][index]}`
          );

          input.addEventListener("input", () => {
            if (input.value === "") return;

            const parsed = Number(input.value);
            if (!Number.isFinite(parsed)) return;

            group[key][index] = Math.max(
              0,
              Math.min(255, Math.round(parsed))
            );

            picker.value = toHex(group[key]);
            changed();
          });

          input.addEventListener("change", () => {
            input.value = group[key][index];
          });

          row.append(input);
          return input;
        });

        picker.addEventListener("input", () => {
          group[key] = [1, 3, 5].map(offset =>
            parseInt(picker.value.slice(offset, offset + 2), 16)
          );

          channels.forEach((input, index) => {
            input.value = group[key][index];
          });

          changed();
        });

        container.append(row);
      } else if (typeof value === "number") {
        const [min, max, step] = limits[path] || featureLimits[groupName]?.[key] || [0, 100, 1];
        const number = element("input");
        const range = element("input");

        number.id = id;
        number.type = "number";
        range.type = "range";
        range.setAttribute("aria-label", title(key));

        function normalize(raw) {
          const clamped = Math.max(min, Math.min(max, raw));
          const stepped =
            min + Math.round((clamped - min) / step) * step;

          return Number(
            Math.max(min, Math.min(max, stepped)).toFixed(6)
          );
        }

        for (const input of [number, range]) {
          input.min = min;
          input.max = max;
          input.step = step;
          input.value = value;

          input.addEventListener("input", () => {
            if (input.value === "") return;

            const parsed = Number(input.value);
            if (!Number.isFinite(parsed)) return;

            group[key] = normalize(parsed);

            if (input === number) range.value = group[key];
            else number.value = group[key];

            changed();
          });

          input.addEventListener("change", () => {
            input.value = group[key];
          });
        }

        heading.append(number);
        container.append(range);
      }

      rows.push({ key, container, text: `${title(key)} ${key} ${hint}`.toLowerCase() });
      body.append(container);
    }
  }

  let featureSection;
  function rebuild() {
    const open = new Map(sections.map(section => [
      section.label, searching ? section.open : section.details.open
    ]));
    const featuresOpen = featureSection && (searching ? featuresWereOpen : featureSection.open);
    controls.replaceChildren();
    sections.length = 0;

    for (const [name, group] of Object.entries(config)) {
      if (name === "features") continue;
      const label = title(name);
      buildGroup(makeSection(controls, label, open.get(label) ?? name === "grains"),
        name, group, label);
    }

    featureSection = makeSection(controls, "Features", featuresOpen ?? true);
    for (const [name, group] of Object.entries(config.features)) {
      const [label, description] = featureInfo[name];
      const details = makeSection(featureSection, label, open.get(label) ?? true);
      details.classList.add("sediment-feature");
      buildGroup(details, name, group, label, description);
    }
    filterSettings();
  }

  let featuresWereOpen = true;
  function filterSettings() {
    const terms = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const active = terms.length > 0;
    const matches = text => terms.every(term => text.includes(term));
    if (active && !searching) featuresWereOpen = featureSection.open;
    let any = false;
    let anyFeature = false;

    for (const section of sections) {
      const { details, rows, feature, label, description, group } = section;
      if (active && !searching) section.open = details.open;
      const groupText = `${feature ? "features " : ""}${label} ${description}`.toLowerCase();
      const groupMatches = matches(groupText);
      const hit = groupMatches || rows.some(row => matches(`${groupText} ${row.text}`));
      details.hidden = active && !hit;
      if (active && hit) details.open = true;
      if (!active && searching) details.open = section.open;
      for (const row of rows) {
        const available = !feature || group.enabled || row.key === "enabled";
        const show = groupMatches || matches(`${groupText} ${row.text}`) ||
          (feature && row.key === "enabled" && hit);
        row.container.hidden = !available || (active && !show);
      }
      any ||= !details.hidden;
      anyFeature ||= feature && !details.hidden;
    }
    featureSection.hidden = !anyFeature;
    if (active && anyFeature) featureSection.open = true;
    if (!active && searching) featureSection.open = featuresWereOpen;
    searching = active;
    help.hidden = true;
    empty.hidden = any;
  }

  function merge(target, values) {
    for (const [key, value] of Object.entries(values)) {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        merge(target[key], value);
      } else {
        target[key] = structuredClone(value);
      }
    }
  }

  presetSelect.addEventListener("change", () => {
    const name = presetSelect.value;
    if (!name) return;
    const next = structuredClone(original);
    merge(next, presets[name]);
    presetApplying = true;
    merge(config, next);
    changed();
    onReset();
    rebuild();
    presetApplying = false;
    status.textContent = `Applied ${name}.`;
  });

  search.addEventListener("input", filterSettings);
  rebuild();

  toggle.addEventListener("click", () => setOpen(true));
  close.addEventListener("click", () => setOpen(false));

  show.addEventListener("click", () => {
    code.hidden = !code.hidden;
    code.value = exportCode();
    show.textContent = code.hidden ? "Show code" : "Hide code";
  });

  root.querySelector(".sediment-copy").addEventListener("click", async () => {
    code.value = exportCode();

    try {
      await navigator.clipboard.writeText(code.value);
      status.textContent = "Configuration copied.";
    } catch {
      code.hidden = false;
      show.textContent = "Hide code";
      code.focus();
      code.select();
      status.textContent = "Press Ctrl+C or ⌘C to copy.";
    }
  });

  root.querySelector(".sediment-reset").addEventListener("click", () => {
    onReset();
    status.textContent = "The grains have been resettled.";
  });

  function onKeyDown(event) {
    if (event.key === "Escape" && panel.classList.contains("open")) {
      setOpen(false);
    }
  }

  document.addEventListener("keydown", onKeyDown);
  code.value = exportCode();

  return {
    destroy() {
      document.removeEventListener("keydown", onKeyDown);
      root.remove();
      style.remove();
    }
  };
}