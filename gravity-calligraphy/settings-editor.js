export function createSettingsEditor({
  config,
  onChange = () => {},
  onReset = () => {},
  onPreset = () => {}
}) {
  const limits = {
    "ribbons.count": [5, 260, 1],
    "ribbons.speed": [10, 180, 1],
    "ribbons.strokeWidth": [0.2, 8, 0.1],
    "ribbons.trailLifetime": [0.3, 10, 0.1],
    "ribbons.opacity": [0, 1, 0.01],
    "ribbons.glow": [0, 15, 0.25],

    "gravity.wells": [0, 10, 1],
    "gravity.strength": [0, 250, 1],
    "gravity.radius": [40, 700, 1],
    "gravity.swirl": [-250, 250, 1],
    "gravity.wandering": [0, 300, 1],
    "gravity.wanderingSpeed": [0, 1, 0.01],

    "mouse.radius": [40, 600, 1],
    "mouse.attraction": [0, 400, 1],
    "mouse.swirl": [-250, 250, 1],
    "mouse.smoothing": [0.5, 20, 0.1],

    "pulse.strength": [0, 500, 1],
    "pulse.swirl": [-300, 300, 1],
    "pulse.speed": [50, 700, 1],
    "pulse.width": [20, 220, 1],
    "pulse.lifetime": [0.5, 6, 0.1],

    "calligraphy.taper": [0, 1, 0.01],
    "calligraphy.speedResponse": [0, 1, 0.01],
    "calligraphy.curvatureResponse": [0, 2, 0.01],

    "silk.intensity": [0, 1, 0.01],
    "silk.twistSpeed": [0, 5, 0.05],
    "silk.twistFrequency": [0.1, 6, 0.1],

    "gradients.intensity": [0, 1, 0.01],
    "gradients.speed": [-0.8, 0.8, 0.01],
    "gradients.repetitions": [0.1, 5, 0.1],

    "bloom.intensity": [0, 2, 0.01],
    "bloom.radius": [1, 15, 0.25],
    "bloom.threshold": [0, 1, 0.01],

    "vortex.intensity": [0, 1.5, 0.01],
    "vortex.size": [10, 120, 1],
    "vortex.rotationSpeed": [-2, 2, 0.05],
    "vortex.sparks": [0, 30, 1],

    "illumination.intensity": [0, 3, 0.05],
    "illumination.widthBoost": [0, 4, 0.05],
    "illumination.decay": [0.2, 8, 0.1],

    "splitting.probability": [0, 1, 0.01],
    "splitting.intensity": [0, 1.5, 0.01],
    "splitting.lifetime": [0.3, 4, 0.1],
    "splitting.maxBranches": [0, 150, 1],

    "stardust.intensity": [0, 1.5, 0.01],
    "stardust.emissionRate": [0, 12, 0.1],
    "stardust.lifetime": [0.3, 6, 0.1],
    "stardust.size": [0.3, 4, 0.1],
    "stardust.maxParticles": [0, 1600, 10],

    "depth.intensity": [0, 1, 0.01],
    "depth.parallax": [0, 80, 1],

    "orbit.intensity": [0, 1.5, 0.01],
    "orbit.captureRadius": [40, 350, 1],
    "orbit.duration": [0.5, 12, 0.1],
    "orbit.frequency": [0, 1, 0.01],

    "wake.intensity": [0, 2, 0.01],
    "wake.radius": [30, 350, 1],
    "wake.lifetime": [0.2, 4, 0.1],

    "distortion.intensity": [0, 2, 0.01],
    "distortion.gravityStrength": [0, 2, 0.01],
    "distortion.pulseStrength": [0, 2, 0.01],

    "appearance.exposure": [0.3, 3, 0.05],

    "animation.speed": [0, 3, 0.05],
    "animation.pixelRatio": [0.5, 2.5, 0.25]
  };

  const sectionInfo = {
    ribbons: {
      title: "Ribbons",
      description: "Count, movement, stroke width and trail length.",
      keywords: "lines trails threads strands opacity brightness glow"
    },

    gravity: {
      title: "Gravity wells",
      description: "The moving attractors that shape the flow.",
      keywords: "forces attractors swirl wandering movement"
    },

    mouse: {
      title: "Pointer interaction",
      description: "Attract and swirl ribbons with your pointer.",
      keywords: "mouse cursor touch attraction halo smoothing"
    },

    pulse: {
      title: "Click pulses",
      description: "Click or tap the background to release a wave.",
      keywords: "click tap shockwave ring force"
    },

    calligraphy: {
      title: "Calligraphic tips",
      description: "Tapered strokes that react to speed and curvature.",
      keywords: "pen ink brush width taper thickness curve"
    },

    silk: {
      title: "Silk shading",
      description: "Moving highlights suggest twisting luminous silk.",
      keywords: "highlight lighting sheen twist ribbon surface"
    },

    gradients: {
      title: "Flowing color gradients",
      description: "Move the palette along the ribbon trails.",
      keywords: "colour color palette rainbow gradient flow"
    },

    bloom: {
      title: "Soft bloom",
      description: "Blur bright regions into a surrounding glow.",
      keywords: "glow light blur radiance brightness"
    },

    vortex: {
      title: "Vortex cores",
      description: "Rotating arcs and sparks reveal gravity wells.",
      keywords: "gravity core spiral orbit arcs sparks"
    },

    illumination: {
      title: "Pulse illumination",
      description: "Waves brighten and widen the ribbons they touch.",
      keywords: "flash energy light width click pulse"
    },

    splitting: {
      title: "Ribbon splitting",
      description: "Pulses produce delicate, fading offshoots.",
      keywords: "branches branch fork offshoot pulse"
    },

    stardust: {
      title: "Fine stardust",
      description: "Small sparks shed from turns and energetic motion.",
      keywords: "particles dust glitter stars sparkle emission"
    },

    depth: {
      title: "Depth layers",
      description: "Vary ribbon scale and brightness with parallax.",
      keywords: "3d distance perspective layer mouse parallax"
    },

    orbit: {
      title: "Orbital choreography",
      description: "Ribbons briefly spiral around wells before escaping.",
      keywords: "capture spiral gravity orbit escape choreography"
    },

    wake: {
      title: "Mouse wake",
      description: "Pointer motion leaves a temporary swirling current.",
      keywords: "mouse pointer cursor trail current wind"
    },

    distortion: {
      title: "Lens distortion",
      description: "Gravity wells and pulses gently bend the image.",
      keywords: "refraction lens warp bend ripple"
    },

    appearance: {
      title: "Appearance",
      description: "Background, ribbon palette and overall exposure.",
      keywords: "color colour palette background exposure"
    },

    animation: {
      title: "Animation and quality",
      description: "Playback, reduced motion and rendering resolution.",
      keywords: "pause speed accessibility performance resolution dpr"
    }
  };

  const labels = {
    "ribbons.glow": "Stroke glow",
    "mouse.enabled": "Enable pointer interaction",
    "mouse.showHalo": "Show pointer halo",
    "pulse.enabled": "Enable click pulses",

    "calligraphy.enabled": "Enable calligraphic tips",
    "silk.enabled": "Enable silk shading",
    "gradients.enabled": "Enable flowing gradients",
    "bloom.enabled": "Enable bloom",
    "vortex.enabled": "Enable vortex cores",
    "illumination.enabled": "Enable pulse illumination",
    "splitting.enabled": "Enable ribbon splitting",
    "stardust.enabled": "Enable stardust",
    "depth.enabled": "Enable depth layers",
    "orbit.enabled": "Enable orbital choreography",
    "wake.enabled": "Enable mouse wake",
    "distortion.enabled": "Enable lens distortion",

    "splitting.probability": "Split probability",
    "orbit.frequency": "Capture frequency",
    "depth.parallax": "Pointer parallax",
    "animation.pixelRatio": "Maximum pixel ratio"
  };

  const hints = {
    "ribbons.glow":
      "Local glow around each stroke. Soft bloom is controlled separately.",

    "calligraphy.speedResponse":
      "Higher values make fast strokes thinner.",

    "calligraphy.curvatureResponse":
      "Higher values make curved strokes fuller.",

    "bloom.threshold":
      "Only pixels brighter than this threshold contribute to bloom.",

    "splitting.probability":
      "Chance of an offshoot when a pulse first reaches a ribbon.",

    "orbit.frequency":
      "How often nearby ribbons can enter an orbit.",

    "animation.pixelRatio":
      "Lower values reduce GPU load on large or high-density screens.",

    "animation.respectReducedMotion":
      "Show a still composition when the operating system requests reduced motion."
  };

  const style = document.createElement("style");

  style.textContent = `
    .gc-editor {
      position: fixed;
      inset: 0;
      z-index: 10000;
      pointer-events: none;
      color: #e6eaf4;
      font: 13px/1.5 system-ui, sans-serif;
      color-scheme: dark;
    }

    .gc-editor * {
      box-sizing: border-box;
    }

    .gc-editor [hidden] {
      display: none !important;
    }

    .gc-editor button,
    .gc-editor input,
    .gc-editor select,
    .gc-editor textarea {
      font: inherit;
    }

    .gc-editor button,
    .gc-editor select {
      min-height: 42px;
      border: 1px solid #ffffff24;
      border-radius: 8px;
      background: #263148;
      color: inherit;
    }

    .gc-editor button {
      padding: 8px 12px;
      cursor: pointer;
    }

    .gc-editor button:hover {
      background: #35435e;
    }

    .gc-editor :focus-visible {
      outline: 2px solid #a8d7e8;
      outline-offset: 3px;
    }

    .gc-toggle {
      position: absolute;
      top: 16px;
      right: 16px;
      pointer-events: auto;
      background: #101827d9 !important;
      backdrop-filter: blur(12px);
    }

    .gc-panel {
      position: absolute;
      inset: 0 0 0 auto;
      display: flex;
      flex-direction: column;
      width: min(390px, 100vw);
      height: 100%;
      border-left: 1px solid #ffffff20;
      background: #0b111ff2;
      backdrop-filter: blur(18px);
      pointer-events: auto;
      transform: translateX(100%);
      transition: transform 220ms ease;
      box-shadow: -14px 0 60px #00000035;
    }

    .gc-panel.open {
      transform: translateX(0);
    }

    .gc-top {
      flex: 0 0 auto;
      padding: 19px 20px 14px;
      border-bottom: 1px solid #ffffff16;
      background: #0d1524f5;
    }

    .gc-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .gc-heading h2 {
      margin: 0;
      font-size: 18px;
      letter-spacing: -0.02em;
    }

    .gc-subtitle {
      margin: 7px 0 15px;
      color: #a4b5ca;
      font-size: 12px;
    }

    .gc-search-row {
      display: flex;
      align-items: center;
      gap: 7px;
    }

    .gc-search {
      width: 100%;
      min-width: 0;
      height: 43px;
      padding: 10px 12px;
      border: 1px solid #ffffff26;
      border-radius: 8px;
      background: #070e1b;
      color: #e6eaf4;
    }

    .gc-search::placeholder {
      color: #8498b0;
    }

    .gc-clear {
      flex: 0 0 auto;
    }

    .gc-search-status {
      min-height: 18px;
      margin-top: 5px;
      color: #9bb0c7;
      font-size: 11px;
    }

    .gc-scroll {
      flex: 1 1 auto;
      overflow-y: auto;
      overscroll-behavior: contain;
      scrollbar-width: thin;
      scrollbar-color: #4d617e transparent;
      padding: 17px 20px 28px;
    }

    .gc-preset-label {
      display: block;
      margin-bottom: 5px;
      color: #b6c7da;
      font-size: 12px;
    }

    .gc-preset {
      width: 100%;
      padding: 8px 10px;
    }

    .gc-tools {
      display: flex;
      gap: 7px;
      margin: 12px 0 16px;
    }

    .gc-tools button {
      flex: 1;
      min-height: 35px;
      padding: 6px;
      font-size: 12px;
      background: #ffffff08;
    }

    .gc-section {
      margin-bottom: 9px;
      border: 1px solid #ffffff16;
      border-radius: 10px;
      background: #ffffff025;
    }

    .gc-section > summary {
      display: flex;
      align-items: center;
      gap: 9px;
      min-height: 48px;
      padding: 11px 12px;
      list-style: none;
      cursor: pointer;
      user-select: none;
      font-weight: 600;
      color: #c7ddea;
    }

    .gc-section > summary::-webkit-details-marker {
      display: none;
    }

    .gc-section > summary::before {
      content: "›";
      width: 11px;
      color: #8ba6c1;
      font-size: 19px;
      line-height: 1;
      transition: transform 150ms ease;
    }

    .gc-section[open] > summary::before {
      transform: rotate(90deg);
    }

    .gc-section-name {
      flex: 1;
    }

    .gc-badge {
      padding: 2px 6px;
      border: 1px solid #8fe0c430;
      border-radius: 5px;
      color: #a5e1ca;
      font-size: 10px;
      font-weight: 500;
    }

    .gc-badge.off {
      border-color: #ffffff20;
      color: #8291a8;
    }

    .gc-section-body {
      padding: 0 12px 4px;
    }

    .gc-section-description {
      margin: 0 0 16px;
      color: #8fa5bc;
      font-size: 11px;
    }

    .gc-control {
      margin-bottom: 16px;
    }

    .gc-control-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 6px;
    }

    .gc-control label {
      color: #c9d4e2;
    }

    .gc-control input[type="range"] {
      display: block;
      width: 100%;
      margin: 5px 0 0;
      accent-color: #9dcddd;
      cursor: pointer;
    }

    .gc-control input[type="number"] {
      width: 79px;
      padding: 5px 6px;
      border: 1px solid #ffffff23;
      border-radius: 6px;
      background: #ffffff07;
      color: inherit;
      font-variant-numeric: tabular-nums;
    }

    .gc-control input[type="checkbox"] {
      width: 18px;
      height: 18px;
      margin: 0;
      accent-color: #a0cddd;
      cursor: pointer;
    }

    .gc-hint {
      margin-top: 5px;
      color: #8196af;
      font-size: 11px;
    }

    .gc-colors {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .gc-colors input[type="color"] {
      flex: 0 0 42px;
      width: 42px;
      height: 33px;
      padding: 2px;
      border: 1px solid #ffffff26;
      border-radius: 6px;
      background: transparent;
      cursor: pointer;
    }

    .gc-colors input[type="number"] {
      flex: 1;
      width: 0;
      min-width: 0;
    }

    .gc-empty {
      padding: 25px 10px;
      color: #a8b9cc;
      text-align: center;
    }

    .gc-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      margin-top: 20px;
    }

    .gc-code {
      display: block;
      width: 100%;
      min-height: 300px;
      margin-top: 13px;
      padding: 12px;
      resize: vertical;
      border: 1px solid #ffffff24;
      border-radius: 8px;
      background: #060c17;
      color: #cbddeb;
      font: 11px/1.6 ui-monospace, monospace !important;
    }

    .gc-status {
      min-height: 22px;
      margin-top: 10px;
      color: #a9b8cb;
      font-size: 12px;
    }

    @media (prefers-reduced-motion: reduce) {
      .gc-panel,
      .gc-section > summary::before {
        transition: none;
      }
    }
  `;

  // Correct transparent section background.
  style.textContent = style.textContent.replace(
    "#ffffff025",
    "rgba(255,255,255,0.012)"
  );

  document.head.append(style);

  const root = document.createElement("div");
  root.className = "gc-editor";
  root.dataset.backgroundEditor = "";

  root.innerHTML = `
    <button
      class="gc-toggle"
      type="button"
      aria-expanded="false"
      aria-controls="gc-panel"
    >
      Settings
    </button>

    <aside
      id="gc-panel"
      class="gc-panel"
      aria-label="Gravity Calligraphy settings"
      inert
    >
      <div class="gc-top">
        <div class="gc-heading">
          <h2>Gravity Calligraphy</h2>
          <button class="gc-close" type="button">Retract</button>
        </div>

        <p class="gc-subtitle">
          Move to guide the ribbons. Click or tap to release a pulse.
        </p>

        <div class="gc-search-row" role="search">
          <input
            id="gc-search"
            class="gc-search"
            type="search"
            placeholder="Search settings…"
            aria-label="Search background settings"
            autocomplete="off"
            spellcheck="false"
          >
          <button
            class="gc-clear"
            type="button"
            aria-label="Clear settings search"
            hidden
          >
            Clear
          </button>
        </div>

        <div
          class="gc-search-status"
          role="status"
          aria-live="polite"
        ></div>
      </div>

      <div class="gc-scroll">
        <label class="gc-preset-label" for="gc-preset">
          Visual preset
        </label>

        <select id="gc-preset" class="gc-preset">
          <option value="custom" disabled>Custom settings</option>
          <option value="quiet">Quiet Ink</option>
          <option value="silk" selected>Luminous Silk</option>
          <option value="cosmic">Cosmic Vortex</option>
        </select>

        <div class="gc-tools">
          <button class="gc-expand" type="button">Expand all</button>
          <button class="gc-collapse" type="button">Collapse all</button>
        </div>

        <div class="gc-controls"></div>

        <div class="gc-empty" hidden>
          No matching settings. Try “glow”, “mouse” or “speed”.
        </div>

        <div class="gc-actions">
          <button class="gc-show" type="button">Show code</button>
          <button class="gc-copy" type="button">Copy config</button>
          <button class="gc-reset" type="button">New ribbons</button>
        </div>

        <textarea
          class="gc-code"
          aria-label="Configuration code"
          spellcheck="false"
          readonly
          hidden
        ></textarea>

        <div
          class="gc-status"
          role="status"
          aria-live="polite"
        ></div>
      </div>
    </aside>
  `;

  document.body.append(root);

  const toggle = root.querySelector(".gc-toggle");
  const panel = root.querySelector(".gc-panel");
  const close = root.querySelector(".gc-close");
  const search = root.querySelector(".gc-search");
  const clear = root.querySelector(".gc-clear");
  const searchStatus = root.querySelector(".gc-search-status");
  const controls = root.querySelector(".gc-controls");
  const empty = root.querySelector(".gc-empty");
  const preset = root.querySelector(".gc-preset");
  const code = root.querySelector(".gc-code");
  const show = root.querySelector(".gc-show");
  const status = root.querySelector(".gc-status");

  const sectionRecords = [];
  const synchronizers = [];

  let searchActive = false;
  let savedOpenStates = new Map();

  function title(value) {
    return value
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, letter => letter.toUpperCase());
  }

  function normalize(value) {
    return value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
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

  function exportCode() {
    return `const config = ${JSON.stringify(config, null, 2)};`;
  }

  function setOpen(open) {
    if (!open && panel.contains(document.activeElement)) {
      toggle.hidden = false;
      toggle.focus();
    }

    panel.classList.toggle("open", open);
    panel.inert = !open;
    toggle.hidden = open;
    toggle.setAttribute("aria-expanded", String(open));

    if (open) search.focus();
  }

  function updateBadges() {
    for (const section of sectionRecords) {
      if (!section.badge) continue;

      const enabled = config[section.groupName].enabled;

      section.badge.textContent = enabled ? "ON" : "OFF";
      section.badge.classList.toggle("off", !enabled);
    }
  }

  function changed(path) {
    preset.value = "custom";
    code.value = exportCode();
    updateBadges();
    onChange(path);
  }

  function syncAll() {
    for (const sync of synchronizers) sync();
    code.value = exportCode();
    updateBadges();
  }

  for (const [groupName, group] of Object.entries(config)) {
    const info = sectionInfo[groupName] || {
      title: title(groupName),
      description: "",
      keywords: ""
    };

    const details = element("details", "gc-section");
    details.open = groupName === "ribbons";

    const summary = element("summary");
    const name = element("span", "gc-section-name");
    name.textContent = info.title;
    summary.append(name);

    let badge = null;

    if (typeof group.enabled === "boolean") {
      badge = element("span", "gc-badge");
      badge.setAttribute("aria-hidden", "true");
      summary.append(badge);
    }

    const body = element("div", "gc-section-body");
    const description = element("p", "gc-section-description");
    description.textContent = info.description;
    body.append(description);

    const record = {
      groupName,
      details,
      badge,
      rows: [],

      text: normalize(
        `${groupName} ${info.title} ${info.description} ${info.keywords}`
      )
    };

    for (const [key, value] of Object.entries(group)) {
      const path = `${groupName}.${key}`;
      const labelText = labels[path] || title(key);
      const id = `gc-${groupName}-${key}`;

      const container = element("div", "gc-control");
      const heading = element("div", "gc-control-title");
      const label = element("label");

      label.textContent = labelText;
      label.htmlFor = id;

      heading.append(label);
      container.append(heading);

      const row = {
        container,
        ownText: normalize(
          `${key} ${path} ${labelText} ${hints[path] || ""}`
        )
      };

      record.rows.push(row);

      if (typeof value === "boolean") {
        const input = element("input");
        input.id = id;
        input.type = "checkbox";
        input.checked = value;

        input.addEventListener("change", () => {
          group[key] = input.checked;
          changed(path);
        });

        synchronizers.push(() => {
          input.checked = group[key];
        });

        heading.append(input);

      } else if (Array.isArray(value)) {
        const colorRow = element("div", "gc-colors");
        const picker = element("input");

        picker.id = id;
        picker.type = "color";
        picker.value = toHex(value);

        colorRow.append(picker);

        const channels = value.map((channel, index) => {
          const input = element("input");

          input.type = "number";
          input.min = "0";
          input.max = "255";
          input.step = "1";
          input.value = String(channel);

          input.setAttribute(
            "aria-label",
            `${labelText}: ${["red", "green", "blue"][index]}`
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
            changed(path);
          });

          input.addEventListener("change", () => {
            input.value = String(group[key][index]);
          });

          colorRow.append(input);
          return input;
        });

        picker.addEventListener("input", () => {
          group[key] = [1, 3, 5].map(offset =>
            parseInt(picker.value.slice(offset, offset + 2), 16)
          );

          channels.forEach((input, index) => {
            input.value = String(group[key][index]);
          });

          changed(path);
        });

        synchronizers.push(() => {
          picker.value = toHex(group[key]);

          channels.forEach((input, index) => {
            input.value = String(group[key][index]);
          });
        });

        container.append(colorRow);

      } else if (typeof value === "number") {
        const [min, max, step] = limits[path] || [0, 100, 1];

        const number = element("input");
        const range = element("input");

        number.id = id;
        number.type = "number";
        range.type = "range";
        range.setAttribute("aria-label", labelText);

        function normalizeNumber(raw) {
          const clamped = Math.max(min, Math.min(max, raw));
          const stepped =
            min + Math.round((clamped - min) / step) * step;

          return Number(
            Math.max(min, Math.min(max, stepped)).toFixed(6)
          );
        }

        for (const input of [number, range]) {
          input.min = String(min);
          input.max = String(max);
          input.step = String(step);
          input.value = String(value);

          input.addEventListener("input", () => {
            if (input.value === "") return;

            const parsed = Number(input.value);
            if (!Number.isFinite(parsed)) return;

            group[key] = normalizeNumber(parsed);

            if (input === number) {
              range.value = String(group[key]);
            } else {
              number.value = String(group[key]);
            }

            changed(path);
          });

          input.addEventListener("change", () => {
            number.value = String(group[key]);
            range.value = String(group[key]);
          });
        }

        synchronizers.push(() => {
          number.value = String(group[key]);
          range.value = String(group[key]);
        });

        heading.append(number);
        container.append(range);
      }

      if (hints[path]) {
        const hint = element("div", "gc-hint");
        hint.id = `${id}-hint`;
        hint.textContent = hints[path];

        container.append(hint);

        for (const input of container.querySelectorAll("input")) {
          input.setAttribute("aria-describedby", hint.id);
        }
      }

      body.append(container);
    }

    details.append(summary, body);
    controls.append(details);
    sectionRecords.push(record);
  }

  function filterSettings() {
    const query = normalize(search.value);
    const tokens = query.split(/\s+/).filter(Boolean);
    const active = tokens.length > 0;

    clear.hidden = !search.value;

    if (active && !searchActive) {
      savedOpenStates = new Map(
        sectionRecords.map(record => [
          record.groupName,
          record.details.open
        ])
      );
    }

    let matchingRows = 0;
    let matchingSections = 0;

    for (const section of sectionRecords) {
      let visibleRows = 0;

      for (const row of section.rows) {
        const haystack = `${section.text} ${row.ownText}`;

        const matches = !active ||
          tokens.every(token => haystack.includes(token));

        row.container.hidden = !matches;

        if (matches) {
          visibleRows++;
          matchingRows++;
        }
      }

      section.details.hidden = visibleRows === 0;

      if (visibleRows > 0) {
        matchingSections++;

        if (active) {
          section.details.open = true;
        } else if (searchActive) {
          section.details.open =
            savedOpenStates.get(section.groupName) ?? false;
        }
      }
    }

    searchActive = active;
    empty.hidden = matchingRows > 0;

    searchStatus.textContent = active
      ? `${matchingRows} setting${matchingRows === 1 ? "" : "s"} in ` +
        `${matchingSections} section${matchingSections === 1 ? "" : "s"}`
      : "Search by setting, feature or section name.";
  }

  function clearSearch() {
    search.value = "";
    filterSettings();
    search.focus();
  }

  search.addEventListener("input", filterSettings);
  clear.addEventListener("click", clearSearch);

  root.querySelector(".gc-expand").addEventListener("click", () => {
    for (const section of sectionRecords) {
      if (!section.details.hidden) section.details.open = true;
    }
  });

  root.querySelector(".gc-collapse").addEventListener("click", () => {
    for (const section of sectionRecords) {
      if (!section.details.hidden) section.details.open = false;
    }
  });

  preset.addEventListener("change", () => {
    if (preset.value === "custom") return;

    onPreset(preset.value);
    syncAll();
    filterSettings();

    status.textContent =
      `${preset.options[preset.selectedIndex].text} applied.`;
  });

  toggle.addEventListener("click", () => setOpen(true));
  close.addEventListener("click", () => setOpen(false));

  show.addEventListener("click", () => {
    code.hidden = !code.hidden;
    code.value = exportCode();
    show.textContent = code.hidden ? "Show code" : "Hide code";
  });

  root.querySelector(".gc-copy").addEventListener("click", async () => {
    code.value = exportCode();

    try {
      await navigator.clipboard.writeText(code.value);
      status.textContent = "Configuration copied.";
    } catch {
      code.hidden = false;
      show.textContent = "Hide code";
      code.focus();
      code.select();

      status.textContent =
        "Press Ctrl+C or ⌘C to copy the selected configuration.";
    }
  });

  root.querySelector(".gc-reset").addEventListener("click", () => {
    onReset();
    status.textContent = "New ribbons and gravity wells generated.";
  });

  function handleKeyDown(event) {
    if (
      event.key === "Escape" &&
      panel.classList.contains("open")
    ) {
      event.preventDefault();

      if (search.value) {
        clearSearch();
      } else {
        setOpen(false);
      }
    }
  }

  document.addEventListener("keydown", handleKeyDown);

  syncAll();
  filterSettings();

  return {
    refresh: syncAll,

    destroy() {
      document.removeEventListener("keydown", handleKeyDown);
      root.remove();
      style.remove();
    }
  };
}
