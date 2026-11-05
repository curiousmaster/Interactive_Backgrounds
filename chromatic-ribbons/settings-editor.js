export function createSettingsEditor({
  config,
  onChange = () => {},
  onReset = () => {}
}) {
  const clone = value => JSON.parse(JSON.stringify(value));

  const defaults = clone(config);
  const controls = [];
  const sections = [];
  const featureViews = [];

  const names = {
    bloom: "Soft bloom",
    iridescence: "Iridescent ribbons",
    depth: "Depth and perspective",
    depthOfField: "Depth of field",
    pulses: "Traveling light pulses",
    surface: "Flowing surface texture",
    vortices: "Vortex fields",
    sparks: "Crossing sparks",
    chromatic: "Chromatic separation",
    breathing: "Ribbon breathing"
  };

  const help = {
    ribbons:
      "More drawing steps make denser ribbons. Dense settings may " +
      "shorten trails when the geometry budget is full.",

    colors:
      "Disable Randomize on reset to use the base hue. " +
      "Additive blending brightens overlaps.",

    canvas:
      "Lifetime is measured in animation seconds. At speed 2.35, " +
      "a 10-second trail lasts about 4.26 real seconds.",

    mouse:
      "Enable mouse interaction to pull, swirl and bend nearby " +
      "connections. Hold for a stronger effect.",

    features:
      "Enable any combination. Controls appear only while a feature " +
      "is enabled. Search never enables features.",

    bloom:
      "Extracts bright areas, blurs them and adds the glow back to " +
      "the scene. Lower the threshold for more glow.",

    iridescence:
      "Animated rainbow shading across and along each strand.",

    depth:
      "Projects ribbon endpoints at different depths. Tilt is in " +
      "degrees. Pointer forces still operate in the simulation plane.",

    depthOfField:
      "Analytic depth blur softens out-of-focus strands. Works " +
      "independently of perspective; focus depth ranges from -1 to 1.",

    pulses:
      "Light packets travel along each connection. Frequency is " +
      "pulses per animation second; length is in pixels.",

    surface:
      "Threads, grain or bands shade the ribbon surface. " +
      "A wider line makes the texture easier to see.",

    vortices:
      "Wandering force fields curl the moving endpoints. " +
      "Existing trails stay where they were drawn.",

    sparks:
      "Particles spawn at crossings of current endpoint connections, " +
      "up to the selected rate. Lifetime uses animation seconds.",

    chromatic:
      "Offsets red and blue channels around bright strands. " +
      "Direction is in degrees; distance is in CSS pixels.",

    breathing:
      "Animates strand width and brightness. Synchronization 1 " +
      "makes every strand breathe together."
  };

  const limits = {
    "ribbons.points": [2, 40, 1],
    "ribbons.speed": [5, 180, 1],
    "ribbons.stepsPerSecond": [30, 600, 10],
    "ribbons.lineWidth": [0.2, 8, 0.1],
    "ribbons.opacity": [0.001, 0.08, 0.001],
    "ribbons.curvature": [0, 2, 0.01],

    "colors.hue": [0, 360, 1],
    "colors.hueSpread": [0, 360, 1],
    "colors.saturation": [0, 100, 1],
    "colors.lightness": [10, 90, 1],
    "colors.hueDrift": [0, 20, 0.1],

    "canvas.trailLifetime": [0.5, 60, 0.5],
    "canvas.pixelRatio": [1, 2, 0.5],

    "mouse.radius": [40, 500, 1],
    "mouse.attraction": [-200, 300, 1],
    "mouse.swirl": [-300, 300, 1],
    "mouse.ribbonBend": [0, 250, 1],
    "mouse.flowInfluence": [0, 4, 0.05],
    "mouse.dragStrength": [0, 2, 0.05],
    "mouse.holdMultiplier": [1, 4, 0.1],
    "mouse.smoothing": [0.5, 20, 0.1],

    "animation.speed": [0, 3, 0.05],

    "bloom.strength": [0, 4, 0.05],
    "bloom.radius": [0.5, 12, 0.5],
    "bloom.threshold": [0, 1, 0.01],

    "iridescence.strength": [0, 1, 0.05],
    "iridescence.frequency": [0.1, 8, 0.1],
    "iridescence.speed": [0, 4, 0.05],

    "depth.range": [0, 1, 0.05],
    "depth.perspective": [0, 1, 0.05],
    "depth.tilt": [-55, 55, 1],

    "depthOfField.focus": [-1, 1, 0.05],
    "depthOfField.focusRange": [0, 1, 0.05],
    "depthOfField.blur": [0, 16, 0.5],

    "pulses.speed": [10, 500, 5],
    "pulses.length": [10, 300, 5],
    "pulses.frequency": [0.1, 4, 0.1],
    "pulses.intensity": [0, 6, 0.1],

    "surface.scale": [0.1, 5, 0.1],
    "surface.contrast": [0, 1, 0.05],
    "surface.speed": [0, 100, 1],

    "vortices.count": [1, 8, 1],
    "vortices.radius": [50, 800, 10],
    "vortices.strength": [-300, 300, 5],
    "vortices.wander": [0, 2, 0.05],

    "sparks.rate": [1, 60, 1],
    "sparks.size": [1, 20, 0.5],
    "sparks.lifetime": [0.1, 4, 0.1],
    "sparks.brightness": [0.1, 4, 0.1],

    "chromatic.distance": [0, 15, 0.25],
    "chromatic.direction": [-180, 180, 1],
    "chromatic.threshold": [0, 1, 0.01],

    "breathing.width": [0, 0.9, 0.05],
    "breathing.brightness": [0, 0.9, 0.05],
    "breathing.frequency": [0.05, 2, 0.05],
    "breathing.synchronization": [0, 1, 0.05]
  };

  const title = value => value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, character => character.toUpperCase());

  const element = (tag, className, text) => {
    const node = document.createElement(tag);

    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;

    return node;
  };

  const style = element("style");

  style.textContent = `
    .ribbon-editor {
      position:fixed;
      inset:0;
      z-index:10000;
      pointer-events:none;
      color:#e8eaf4;
      font:13px/1.5 system-ui,sans-serif;
      color-scheme:dark;
    }

    .ribbon-editor * { box-sizing:border-box; }
    .ribbon-editor [hidden] { display:none!important; }

    .ribbon-editor button,
    .ribbon-editor input,
    .ribbon-editor select,
    .ribbon-editor textarea {
      font:inherit;
    }

    .ribbon-editor button {
      min-height:40px;
      padding:8px 11px;
      border:1px solid #ffffff28;
      border-radius:7px;
      background:#2c3148;
      color:inherit;
      cursor:pointer;
    }

    .ribbon-editor button:hover {
      background:#404760;
    }

    .ribbon-editor :focus-visible {
      outline:2px solid #b2cdea;
      outline-offset:3px;
    }

    .ribbon-toggle {
      position:absolute;
      top:16px;
      right:16px;
      pointer-events:auto;
    }

    .ribbon-panel {
      position:absolute;
      top:0;
      right:0;
      width:min(380px,100vw);
      height:100%;
      padding:22px;
      overflow:auto;
      overscroll-behavior:contain;
      background:rgba(12,17,29,.96);
      border-left:1px solid #ffffff20;
      backdrop-filter:blur(16px);
      pointer-events:auto;
      transform:translateX(100%);
      transition:transform .22s ease;
    }

    .ribbon-panel.open {
      transform:translateX(0);
    }

    .ribbon-heading,
    .ribbon-control-title {
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:10px;
    }

    .ribbon-heading h2 {
      margin:0;
      font-size:18px;
    }

    .ribbon-help,
    .ribbon-status {
      color:#adb9ce;
      font-size:12px;
      line-height:1.6;
    }

    .ribbon-section {
      border-top:1px solid #ffffff24;
      padding:12px 0;
    }

    .ribbon-section > summary {
      padding:5px 0 12px;
      cursor:pointer;
      font-weight:600;
      color:#b9d3e9;
    }

    .ribbon-feature {
      margin:8px 0;
      padding:12px;
      background:#ffffff05;
      border:1px solid #ffffff18;
      border-radius:8px;
    }

    .ribbon-feature-toggle {
      display:flex;
      justify-content:space-between;
      align-items:center;
      gap:12px;
      font-weight:600;
    }

    .ribbon-feature-body {
      padding-top:8px;
    }

    .ribbon-control {
      margin:0 0 13px;
    }

    .ribbon-control-title {
      margin-bottom:6px;
    }

    .ribbon-panel input[type=range] {
      width:100%;
      accent-color:#a8c5df;
    }

    .ribbon-panel input[type=number] {
      width:82px;
      padding:5px;
      border:1px solid #ffffff24;
      border-radius:5px;
      background:#ffffff08;
      color:inherit;
    }

    .ribbon-panel input[type=checkbox] {
      accent-color:#a8c5df;
      width:18px;
      height:18px;
    }

    .ribbon-search,
    .ribbon-presets,
    .ribbon-panel select {
      width:100%;
      padding:10px;
      margin:6px 0 12px;
      border:1px solid #ffffff30;
      border-radius:6px;
      background:#1c2333;
      color:inherit;
    }

    .ribbon-colors {
      display:flex;
      align-items:center;
      gap:6px;
    }

    .ribbon-colors input[type=number] {
      width:62px;
      min-width:0;
    }

    .ribbon-panel input[type=color] {
      width:42px;
      height:32px;
      background:transparent;
      border:1px solid #ffffff24;
    }

    .ribbon-actions {
      display:flex;
      flex-wrap:wrap;
      gap:8px;
      margin-top:12px;
    }

    .ribbon-code {
      width:100%;
      min-height:260px;
      margin-top:14px;
      padding:12px;
      border:1px solid #ffffff24;
      border-radius:7px;
      background:#060b16;
      color:#cddded;
      font:11px/1.6 monospace!important;
    }

    .ribbon-status {
      min-height:20px;
      margin-top:10px;
    }

    @media(prefers-reduced-motion:reduce) {
      .ribbon-panel {
        transition:none;
      }
    }
  `;

  document.head.append(style);

  const root = element("div", "ribbon-editor");
  root.dataset.backgroundEditor = "";

  root.innerHTML = `
    <button class="ribbon-toggle"
      aria-expanded="false"
      aria-controls="ribbon-settings-panel">
      Settings
    </button>

    <aside id="ribbon-settings-panel"
      class="ribbon-panel"
      aria-label="Chromatic Ribbons settings"
      inert>

      <div class="ribbon-heading">
        <h2>Chromatic Ribbons</h2>
        <button class="ribbon-close">Retract</button>
      </div>

      <p class="ribbon-help">
        Live WebGL settings. Enable mouse interaction to pull and
        swirl ribbons. Copy your config to keep changes.
      </p>

      <label for="ribbon-search">Search settings</label>

      <input id="ribbon-search"
        class="ribbon-search"
        type="search"
        placeholder="Try bloom, lifetime, or pulses…">

      <label for="ribbon-presets">Preset</label>

      <select id="ribbon-presets" class="ribbon-presets">
        <option value="">Custom settings</option>
        <option value="preferred">Preferred flow</option>
        <option value="aurora">Aurora silk</option>
        <option value="embers">Ember storm</option>
        <option value="prism">Prismatic depth</option>
      </select>

      <p class="ribbon-empty ribbon-help" role="status" hidden>
        No matching settings.
      </p>

      <div class="ribbon-controls"></div>

      <div class="ribbon-actions">
        <button class="ribbon-show">Show code</button>
        <button class="ribbon-copy">Copy config</button>
        <button class="ribbon-reset">New composition</button>
      </div>

      <textarea class="ribbon-code"
        aria-label="Configuration code"
        spellcheck="false"
        readonly
        hidden></textarea>

      <div class="ribbon-status"
        role="status"
        aria-live="polite"></div>
    </aside>
  `;

  root.querySelectorAll("button").forEach(button => {
    button.type = "button";
  });

  document.body.append(root);

  const panel = root.querySelector(".ribbon-panel");
  const toggle = root.querySelector(".ribbon-toggle");
  const close = root.querySelector(".ribbon-close");
  const holder = root.querySelector(".ribbon-controls");
  const search = root.querySelector(".ribbon-search");
  const preset = root.querySelector(".ribbon-presets");
  const code = root.querySelector(".ribbon-code");
  const show = root.querySelector(".ribbon-show");
  const status = root.querySelector(".ribbon-status");

  const exportCode = () =>
    `const config = ${JSON.stringify(config, null, 2)};`;

  function setOpen(open) {
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

  function changed() {
    preset.value = "";
    code.value = exportCode();

    filter();
    onChange();

    if (!config.panel.enabled) {
      setOpen(false);
      root.hidden = true;
    }
  }

  function section(key) {
    const node = element("details", "ribbon-section");

    node.open = key === "ribbons" || key === "features";

    node.append(
      element("summary", null, title(key)),
      element("p", "ribbon-help", help[key] || "")
    );

    holder.append(node);

    sections.push({
      node,
      saved: node.open
    });

    return node;
  }

  function control(parent, group, key, path, feature = null) {
    const row = element("div", "ribbon-control");
    const heading = element("div", "ribbon-control-title");
    const label = element("label", null, title(key));

    const id = "ribbon-" + path.replaceAll(".", "-");

    label.htmlFor = id;
    heading.append(label);
    row.append(heading);
    parent.append(row);

    const record = {
      row,
      feature,
      text: (
        path + " " +
        title(key) + " " +
        (feature ? names[feature] : "")
      ).toLowerCase()
    };

    controls.push(record);

    const value = group[key];
    let sync;

    if (typeof value === "boolean") {
      const input = element("input");

      input.type = "checkbox";
      input.id = id;

      heading.append(input);

      input.addEventListener("change", () => {
        group[key] = input.checked;
        changed();
      });

      sync = () => {
        input.checked = group[key];
      };

    } else if (typeof value === "string") {
      const input = element("select");
      input.id = id;

      ["threads", "grain", "bands"].forEach(value => {
        const option = element("option", null, title(value));
        option.value = value;
        input.append(option);
      });

      row.append(input);

      input.addEventListener("change", () => {
        group[key] = input.value;
        changed();
      });

      sync = () => {
        input.value = group[key];
      };

    } else if (Array.isArray(value)) {
      const colors = element("div", "ribbon-colors");
      const picker = element("input");

      picker.type = "color";
      picker.id = id;
      colors.append(picker);

      const hex = () => "#" + group[key].map(channel =>
        Math.round(channel).toString(16).padStart(2, "0")
      ).join("");

      const channels = value.map((channel, index) => {
        const input = element("input");

        input.type = "number";
        input.min = 0;
        input.max = 255;
        input.step = 1;

        input.setAttribute(
          "aria-label",
          title(key) + " " + ["red", "green", "blue"][index]
        );

        colors.append(input);

        input.addEventListener("input", () => {
          if (
            input.value === "" ||
            !Number.isFinite(input.valueAsNumber)
          ) {
            return;
          }

          group[key][index] = Math.max(
            0,
            Math.min(255, Math.round(input.valueAsNumber))
          );

          picker.value = hex();
          changed();
        });

        input.addEventListener("change", () => {
          input.value = group[key][index];
        });

        return input;
      });

      picker.addEventListener("input", () => {
        group[key] = [1, 3, 5].map(offset =>
          parseInt(picker.value.slice(offset, offset + 2), 16)
        );

        sync();
        changed();
      });

      row.append(colors);

      sync = () => {
        picker.value = hex();

        channels.forEach((input, index) => {
          input.value = group[key][index];
        });
      };

    } else {
      const lookup = path.replace("features.", "");

      const [min, max, step] =
        limits[lookup] || [0, 100, 1];

      const number = element("input");
      const range = element("input");

      number.type = "number";
      number.id = id;
      range.type = "range";
      range.setAttribute("aria-label", title(key));

      heading.append(number);
      row.append(range);

      for (const input of [number, range]) {
        Object.assign(input, { min, max, step });

        input.addEventListener("input", () => {
          if (
            input.value === "" ||
            !Number.isFinite(input.valueAsNumber)
          ) {
            return;
          }

          const raw = Math.max(
            min,
            Math.min(max, input.valueAsNumber)
          );

          const stepped =
            min + Math.round((raw - min) / step) * step;

          group[key] = Number(
            Math.max(min, Math.min(max, stepped)).toFixed(6)
          );

          const other = input === number ? range : number;
          other.value = group[key];

          changed();
        });

        input.addEventListener("change", () => {
          sync();
        });
      }

      sync = () => {
        number.value = range.value = group[key];
      };
    }

    record.sync = sync;
    sync();
  }

  for (const [key, group] of Object.entries(config)) {
    const node = section(key);

    if (key !== "features") {
      Object.keys(group).forEach(setting => {
        control(node, group, setting, `${key}.${setting}`);
      });

      continue;
    }

    for (const [feature, settings] of Object.entries(group)) {
      const card = element("div", "ribbon-feature");

      const label = element(
        "label",
        "ribbon-feature-toggle",
        names[feature]
      );

      const input = element("input");

      input.type = "checkbox";
      input.setAttribute("aria-label", names[feature]);

      label.append(input);

      const body = element("div", "ribbon-feature-body");

      body.append(
        element("p", "ribbon-help", help[feature])
      );

      card.append(label, body);
      node.append(card);

      featureViews.push({
        feature,
        card,
        body,
        input,
        text: (
          "features " +
          feature + " " +
          names[feature] + " " +
          Object.keys(settings).map(title).join(" ")
        ).toLowerCase()
      });

      input.addEventListener("change", () => {
        settings.enabled = input.checked;
        changed();
      });

      Object.keys(settings)
        .filter(setting => setting !== "enabled")
        .forEach(setting => {
          control(
            body,
            settings,
            setting,
            `features.${feature}.${setting}`,
            feature
          );
        });
    }
  }

  let searching = false;

  function filter() {
    const words = search.value
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    const matches = text =>
      words.every(word => text.includes(word));

    for (const view of featureViews) {
      const enabled = config.features[view.feature].enabled;

      view.input.checked = enabled;
      view.body.hidden = !enabled;
      view.card.hidden = !matches(view.text);
    }

    for (const record of controls) {
      record.row.hidden = !matches(record.text);
    }

    for (const item of sections) {
      if (!searching && words.length) {
        item.saved = item.node.open;
      }

      const candidates = item.node.querySelectorAll(
        ".ribbon-feature,.ribbon-control"
      );

      const visible = Array.from(candidates).some(node =>
        !node.hidden &&
        !node.closest(".ribbon-feature-body[hidden]")
      );

      item.node.hidden = !visible;

      if (words.length) {
        item.node.open = visible;
      } else if (searching) {
        item.node.open = item.saved;
      }
    }

    searching = words.length > 0;

    root.querySelector(".ribbon-empty").hidden =
      sections.some(item => !item.node.hidden);
  }

  search.addEventListener("input", filter);

  function merge(target, source) {
    for (const [key, value] of Object.entries(source)) {
      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        merge(target[key], value);
      } else {
        target[key] = clone(value);
      }
    }
  }

  const presets = {
    preferred: {},

    aurora: {
      colors: {
        hue: 155,
        hueSpread: 100,
        randomizeOnReset: false
      },
      features: {
        bloom: {
          enabled: true,
          threshold: 0.15
        },
        iridescence: {
          enabled: true
        },
        breathing: {
          enabled: true
        }
      }
    },

    embers: {
      colors: {
        hue: 20,
        hueSpread: 35,
        randomizeOnReset: false
      },
      features: {
        bloom: {
          enabled: true,
          threshold: 0.15
        },
        vortices: {
          enabled: true
        },
        sparks: {
          enabled: true
        },
        pulses: {
          enabled: true
        }
      }
    },

    prism: {
      features: {
        depth: {
          enabled: true
        },
        depthOfField: {
          enabled: true
        },
        chromatic: {
          enabled: true
        },
        surface: {
          enabled: true
        },
        iridescence: {
          enabled: true
        },
        bloom: {
          enabled: true,
          threshold: 0.15
        }
      }
    }
  };

  preset.addEventListener("change", () => {
    const selected = preset.value;

    if (!selected) return;

    merge(config, defaults);
    merge(config, presets[selected]);

    controls.forEach(record => record.sync());

    changed();
    onReset();

    preset.value = selected;

    status.textContent =
      preset.selectedOptions[0].textContent + " applied.";
  });

  toggle.addEventListener("click", () => setOpen(true));
  close.addEventListener("click", () => setOpen(false));

  show.addEventListener("click", () => {
    code.hidden = !code.hidden;
    code.value = exportCode();

    show.textContent = code.hidden
      ? "Show code"
      : "Hide code";
  });

  root.querySelector(".ribbon-copy").addEventListener(
    "click",
    async () => {
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
    }
  );

  root.querySelector(".ribbon-reset").addEventListener(
    "click",
    () => {
      onReset();
      status.textContent = "A new composition has started.";
    }
  );

  function keydown(event) {
    if (
      event.key === "Escape" &&
      panel.classList.contains("open")
    ) {
      setOpen(false);
    }
  }

  document.addEventListener("keydown", keydown);

  code.value = exportCode();
  filter();

  return {
    destroy() {
      document.removeEventListener("keydown", keydown);
      root.remove();
      style.remove();
    }
  };
}