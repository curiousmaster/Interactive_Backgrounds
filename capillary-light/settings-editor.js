export function createSettingsEditor({
  config,
  onChange = () => {},
  onReset = () => {}
}) {
  const original = JSON.parse(JSON.stringify(config));
  const templates = {
    original: {},
    deepFlow: {
      features: {
        view3D: { enabled: true },
        curves: { enabled: true },
        pulses: { enabled: true },
        particles: { enabled: true }
      }
    },
    inkBloom: {
      appearance: { colorA: [51, 223, 198], colorB: [149, 105, 255], colorC: [255, 142, 128] },
      features: {
        bleed: { enabled: true },
        bloom: { enabled: true },
        iridescence: { enabled: true },
        curves: { enabled: true }
      }
    }
  };

  const featureSpecs = {
    view3D: ["3D View", {
      perspective: ["Projection", "Perspective makes distant channels look smaller."],
      depth: ["Depth range", "Height of the waves in the channel surface.", 0, 220, 1],
      tilt: ["Tilt", "Angle of the network surface in degrees.", -55, 55, 1],
      zoom: ["Zoom", "Magnification relative to the view that fills the screen.", 1, 1.8, 0.01]
    }],
    curves: ["Curved capillaries", {
      curvature: ["Curvature", "How far channels bend away from a straight line.", 0, 0.6, 0.01],
      variation: ["Variation", "How much the direction and amount of bend vary by channel.", 0, 1, 0.01]
    }],
    sparks: ["Junction sparks", {
      threshold: ["Threshold", "Secondary ink needed for sparks at a junction.", 0, 0.7, 0.01],
      brightness: ["Brightness", "Intensity and size of the flash.", 0, 3, 0.05],
      duration: ["Duration", "Time for each flash to fade, in seconds.", 0.05, 1, 0.01]
    }],
    pulses: ["Traveling pulses", {
      speed: ["Speed", "How quickly bright packets travel through the network.", 0, 350, 1],
      length: ["Length", "Width of the bright pulse in pixels.", 3, 55, 1],
      density: ["Density", "How closely successive pulses follow one another.", 0.05, 1, 0.01]
    }],
    particles: ["Flow particles", {
      count: ["Count", "Droplets per active channel.", 1, 8, 1],
      size: ["Size", "Droplet radius in pixels.", 0.5, 6, 0.1],
      speed: ["Speed", "Droplet speed in pixels per second.", 0, 200, 1]
    }],
    bleed: ["Capillary bleed", {
      spread: ["Spread", "How far residual ink extends from the channel.", 2, 60, 1],
      persistence: ["Persistence", "How slowly residual ink fades, in seconds.", 0.2, 12, 0.1],
      opacity: ["Opacity", "Visibility of the residual stain.", 0, 0.65, 0.01]
    }],
    bloom: ["Bloom", {
      threshold: ["Threshold", "Minimum ink brightness before bloom appears.", 0, 1, 0.01],
      strength: ["Strength", "Brightness of the soft halo.", 0, 2, 0.01],
      radius: ["Radius", "How far the halo extends from the channel.", 2, 55, 1]
    }],
    shockwaves: ["Pointer shockwaves", {
      speed: ["Speed", "Expansion speed in pixels per second.", 30, 850, 1],
      width: ["Width", "Thickness of the illuminated ring.", 2, 85, 1],
      strength: ["Strength", "How brightly the ring lights channels after a click or tap.", 0, 2, 0.01]
    }],
    iridescence: ["Iridescent ink", {
      hueRange: ["Hue range", "Maximum shift of the ink hue in degrees.", 0, 180, 1],
      strength: ["Strength", "How strongly the shifted hue mixes into the ink.", 0, 1, 0.01],
      speed: ["Speed", "How often the shimmer cycles per second.", 0, 2, 0.01]
    }],
    interference: ["Ink interference", {
      threshold: ["Threshold", "Secondary ink needed to reveal bands.", 0, 0.7, 0.01],
      spacing: ["Band spacing", "Distance between bands along a channel.", 2, 35, 0.5],
      contrast: ["Contrast", "Difference in brightness between bands.", 0, 1, 0.01]
    }]
  };

  const help = {
    channels: {
      spacing: "Distance between network junctions. Smaller values increase channel count.",
      branching: "Chance of a horizontal link between neighboring junctions.",
      irregularity: "How far junctions move off the underlying grid.",
      width: "Width of each channel in pixels.",
      opacity: "Visibility of the channel before ink enters it."
    },
    ink: {
      propagationSpeed: "How quickly ink spreads to connected junctions.",
      diffusion: "How strongly neighboring junctions exchange ink.",
      sourceLifetime: "How long a source continues to emit ink.",
      sourceInterval: "Seconds between new sources. Zero disables new automatic sources.",
      decay: "How quickly ink fades.",
      intensity: "Brightness of ink and strength of automatic sources.",
      glow: "Width of the base glow around active channels."
    },
    mouse: {
      enabled: "Allow the pointer to inject ink.",
      radius: "Distance in pixels over which the pointer affects channels.",
      strength: "How quickly pointer-driven color mixes into the network.",
      smoothing: "How quickly the interaction follows pointer movement.",
      colorCycleSpeed: "Speed of the pointer’s color cycle.",
      showHalo: "Show a faint highlight around the interaction area."
    },
    appearance: {
      backgroundColor: "Base color behind the network.",
      channelColor: "Color of an empty channel.",
      colorA: "Color of the first ink pigment.",
      colorB: "Color of the second ink pigment.",
      colorC: "Color of the third ink pigment."
    },
    animation: {
      speed: "Multiplier for the simulation and animated effects.",
      paused: "Freeze the ink simulation and animated effects.",
      respectReducedMotion: "Freeze animation when the system requests reduced motion."
    },
    panel: { enabled: "Show the settings editor. Copy your config before turning it off." }
  };

  const limits = {
    "channels.spacing": [25, 100, 1],
    "channels.branching": [0, 1, 0.01],
    "channels.irregularity": [0, 1, 0.01],
    "channels.width": [0.3, 4, 0.1],
    "channels.opacity": [0, 0.5, 0.01],

    "ink.propagationSpeed": [0.1, 10, 0.1],
    "ink.diffusion": [0, 1, 0.01],
    "ink.sourceLifetime": [0.5, 20, 0.5],
    "ink.sourceInterval": [0, 15, 0.5],
    "ink.decay": [0.01, 1, 0.01],
    "ink.intensity": [0, 1, 0.01],
    "ink.glow": [0, 25, 0.5],

    "mouse.radius": [30, 300, 1],
    "mouse.strength": [0, 5, 0.1],
    "mouse.smoothing": [0.5, 20, 0.1],
    "mouse.colorCycleSpeed": [0, 2, 0.01],

    "animation.speed": [0, 3, 0.05]
  };

  const style = document.createElement("style");

  style.textContent = `
    .capillary-editor {
      position: fixed;
      inset: 0;
      z-index: 10000;
      pointer-events: none;
      color: #e5ecf1;
      font: 13px/1.5 system-ui, sans-serif;
      color-scheme: dark;
    }

    .capillary-editor * {
      box-sizing: border-box;
    }

    .capillary-editor button,
    .capillary-editor input,
    .capillary-editor textarea {
      font: inherit;
    }

    .capillary-editor button {
      padding: 8px 11px;
      border: 1px solid #ffffff26;
      border-radius: 7px;
      background: #23343e;
      color: inherit;
      cursor: pointer;
    }

    .capillary-editor button:hover {
      background: #354b57;
    }

    .capillary-editor :focus-visible {
      outline: 2px solid #a2d8df;
      outline-offset: 3px;
    }

    .capillary-toggle {
      position: absolute;
      top: 16px;
      right: 16px;
      pointer-events: auto;
    }

    .capillary-panel {
      position: absolute;
      top: 0;
      right: 0;
      width: min(350px, 100vw);
      height: 100%;
      padding: 22px;
      overflow: auto;
      border-left: 1px solid #ffffff20;
      background: rgba(10, 18, 28, 0.94);
      backdrop-filter: blur(16px);
      pointer-events: auto;
      transform: translateX(100%);
      transition: transform 220ms ease;
    }

    .capillary-panel.open {
      transform: translateX(0);
    }

    .capillary-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 8px;
    }

    .capillary-heading h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .capillary-description,
    .capillary-status {
      color: #a5b6c3;
      font-size: 12px;
    }

    .capillary-description {
      margin: 0 0 20px;
    }

    .capillary-control {
      margin-bottom: 13px;
    }

    .capillary-control-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 6px;
    }

    .capillary-panel input[type="range"] {
      width: 100%;
      accent-color: #9acbd5;
    }

    .capillary-panel input[type="number"] {
      width: 76px;
      padding: 4px 6px;
      border: 1px solid #ffffff24;
      border-radius: 5px;
      background: #ffffff08;
      color: inherit;
    }

    .capillary-panel input[type="checkbox"] {
      accent-color: #9acbd5;
    }

    .capillary-colors {
      display: flex;
      align-items: center;
      gap: 7px;
    }

    .capillary-panel input[type="color"] {
      width: 42px;
      height: 30px;
      padding: 2px;
      border: 1px solid #ffffff24;
      border-radius: 5px;
      background: transparent;
    }

    .capillary-colors input[type="number"] {
      width: 65px;
      min-width: 0;
    }

    .capillary-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }

    .capillary-code {
      width: 100%;
      min-height: 260px;
      margin-top: 14px;
      padding: 12px;
      resize: vertical;
      border: 1px solid #ffffff24;
      border-radius: 7px;
      background: #060c15;
      color: #c6dde9;
      font: 11px/1.6 ui-monospace, monospace !important;
    }

    .capillary-status {
      min-height: 20px;
      margin-top: 10px;
    }

    @media (prefers-reduced-motion: reduce) {
      .capillary-panel {
        transition: none;
      }
    }
  `;

  document.head.append(style);

  style.textContent += `
    .capillary-filter {
      display: grid;
      gap: 5px;
      margin: 12px 0;
    }

    .capillary-filter input, .capillary-editor select {
      width: 100%;
      padding: 7px;
      border: 1px solid #ffffff30;
      border-radius: 5px;
      background: #142431;
      color: inherit;
      font: inherit;
    }

    .capillary-controls details {
      border: 1px solid #ffffff20;
      border-radius: 7px;
      padding: 8px 10px;
      margin-bottom: 8px;
    }

    .capillary-controls summary { cursor: pointer; font-weight: 600; }
    .capillary-feature { padding: 3px 0 8px; border-bottom: 1px solid #ffffff18; }
    .capillary-help { margin: 4px 0; color: #a5b6c3; font-size: 11px; }
    .capillary-editor [hidden] { display: none !important; }
    @media (prefers-reduced-motion: reduce) {
      .capillary-panel { transition: none; }
    }
  `;

  const root = document.createElement("div");
  root.className = "capillary-editor";
  root.dataset.backgroundEditor = "";

  root.innerHTML = `
    <button
      class="capillary-toggle"
      type="button"
      aria-expanded="false"
      aria-controls="capillary-settings-panel"
    >Settings</button>

    <aside
      id="capillary-settings-panel"
      class="capillary-panel"
      aria-label="Capillary Light settings"
      inert
    >
      <div class="capillary-heading">
        <h2>Capillary Light</h2>
        <button class="capillary-close" type="button">Retract</button>
      </div>

      <p class="capillary-description">
        Move your pointer to feed color into the channels.
        Source interval 0 disables new automatic sources.
        Copy your configuration before disabling the editor.
      </p>

      <label class="capillary-filter">
        Search settings
        <input class="capillary-search" type="search" placeholder="Try bloom or zoom">
      </label>
      <label class="capillary-filter">
        Template settings
        <select class="capillary-template">
          <option value="">Custom</option>
          <option value="original">Original</option>
          <option value="deepFlow">Deep Flow</option>
          <option value="inkBloom">Ink Bloom</option>
        </select>
      </label>
      <div class="capillary-controls"></div>
      <p class="capillary-empty" role="status" hidden>No matching settings.</p>

      <div class="capillary-actions">
        <button class="capillary-show" type="button">Show code</button>
        <button class="capillary-copy" type="button">Copy config</button>
        <button class="capillary-reset" type="button">New channels</button>
      </div>

      <textarea
        class="capillary-code"
        aria-label="Configuration code"
        spellcheck="false"
        readonly
        hidden
      ></textarea>

      <div
        class="capillary-status"
        role="status"
        aria-live="polite"
      ></div>
    </aside>
  `;

  document.body.append(root);

  const toggle = root.querySelector(".capillary-toggle");
  const panel = root.querySelector(".capillary-panel");
  const close = root.querySelector(".capillary-close");
  const controls = root.querySelector(".capillary-controls");
  const code = root.querySelector(".capillary-code");
  const show = root.querySelector(".capillary-show");
  const status = root.querySelector(".capillary-status");

  function title(value) {
    return value
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, letter => letter.toUpperCase());
  }

  function exportCode() {
    return `const config = ${JSON.stringify(config, null, 2)};`;
  }

  const search = root.querySelector(".capillary-search");
  const template = root.querySelector(".capillary-template");
  const empty = root.querySelector(".capillary-empty");
  const sections = [];
  let isSearching = false;

  function changed(path) {
    code.value = exportCode();
    if (path !== "preset") template.value = "";
    filter();
    onChange(path);

    if (!config.panel.enabled) {
      setOpen(false);
      root.hidden = true;
    }
  }

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

  function makeControl(group, key, path, labelText, helpText, bounds) {
    const value = group[key];
    const container = element("div", "capillary-control");
    const heading = element("div", "capillary-control-title");
    const label = element("label");
    const id = `capillary-${path.replaceAll(".", "-")}`;

    label.textContent = labelText;
    label.htmlFor = id;
    heading.append(label);
    container.append(heading);

    if (path === "features.view3D.perspective") {
      const select = element("select");
      select.id = id;
      for (const [name, value] of [["Orthographic", "false"], ["Perspective", "true"]]) {
        select.add(new Option(name, value));
      }
      select.value = String(value);
      select.addEventListener("change", () => {
        group[key] = select.value === "true";
        changed(path);
      });
      container.append(select);
    } else if (typeof value === "boolean") {
      const input = element("input");

      input.id = id;
      input.type = "checkbox";
      input.checked = value;

      input.addEventListener("change", () => {
        group[key] = input.checked;
        changed(path);
      });

      heading.append(input);
    } else if (Array.isArray(value)) {
      const row = element("div", "capillary-colors");
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
          changed(path);
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

        changed(path);
      });

      container.append(row);
    } else if (typeof value === "number") {
      const [min, max, step] = bounds ?? limits[path];
      const number = element("input");
      const range = element("input");

      number.id = id;
      number.type = "number";
      range.type = "range";
      range.setAttribute("aria-label", labelText);

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

          changed(path);
        });

        input.addEventListener("change", () => {
          input.value = group[key];
        });
      }

      heading.append(number);
      container.append(range);
    }

    if (helpText) {
      const help = element("p", "capillary-help");
      help.id = `${id}-help`;
      help.textContent = helpText;
      container.append(help);
      for (const input of container.querySelectorAll("input, select")) {
        input.setAttribute("aria-describedby", help.id);
      }
    }
    return { element: container, terms: `${labelText} ${helpText ?? ""}`.toLowerCase() };
  }

  function buildControls(openSections = new Map()) {
    controls.replaceChildren();
    sections.length = 0;
    for (const [key, group] of Object.entries(config)) {
      const details = element("details");
      const summary = element("summary");
      summary.textContent = title(key);
      details.open = openSections.get(key) ?? key === "channels";
      details.append(summary);

      const section = { key, details, items: [], wasOpen: details.open };
      sections.push(section);
      controls.append(details);

      if (key === "features") {
        for (const [featureKey, feature] of Object.entries(group)) {
          const [name, definitions] = featureSpecs[featureKey];
          const item = element("div", "capillary-feature");
          const toggle = makeControl(feature, "enabled", `features.${featureKey}.enabled`, name);
          const settings = Object.entries(definitions).map(([key, [label, help, ...bounds]]) =>
            makeControl(feature, key, `features.${featureKey}.${key}`, label, help, bounds));
          item.append(toggle.element, ...settings.map(setting => setting.element));
          details.append(item);
          section.items.push({ element: item, toggle, settings, feature });
        }
      } else {
        for (const keyName of Object.keys(group)) {
          const control = makeControl(group, keyName, `${key}.${keyName}`, title(keyName), help[key]?.[keyName]);
          section.items.push(control);
          details.append(control.element);
        }
      }
    }
    filter();
  }

  function filter() {
    const query = search.value.trim().toLowerCase();
    const words = query.split(/\s+/);
    const matches = text => words.every(word => text.includes(word));
    let anyVisible = false;
    for (const section of sections) {
      const { key, details, items } = section;
      let hasMatch = false;
      for (const item of items) {
        if (item.feature) {
          const name = `features ${item.toggle.terms}`;
          const groupMatch = matches(name);
          const settingsMatch = item.settings.map(setting => matches(`${name} ${setting.terms}`));
          item.element.hidden = !groupMatch && !settingsMatch.some(Boolean);
          item.settings.forEach((setting, index) => {
            setting.element.hidden = !item.feature.enabled || (!groupMatch && !settingsMatch[index]);
          });
        } else {
          item.element.hidden = !matches(`${key} ${item.terms}`);
        }
        hasMatch ||= !item.element.hidden;
      }

      if (query) {
        if (!isSearching) section.wasOpen = details.open;
        details.open = hasMatch;
      } else if (isSearching) {
        details.open = section.wasOpen;
      }
      details.hidden = !hasMatch;
      anyVisible ||= hasMatch;
    }
    isSearching = Boolean(query);
    empty.hidden = anyVisible;
  }

  function merge(target, patch) {
    for (const [key, value] of Object.entries(patch)) {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        merge(target[key], value);
      } else {
        target[key] = Array.isArray(value) ? [...value] : value;
      }
    }
  }

  search.addEventListener("input", filter);
  template.value = "original";
  template.addEventListener("change", () => {
    if (!template.value) return;
    merge(config, original);
    merge(config, templates[template.value]);
    const openSections = new Map(sections.map(section => [
      section.key, isSearching ? section.wasOpen : section.details.open
    ]));
    isSearching = false;
    buildControls(openSections);
    changed("preset");
    status.textContent = `${template.selectedOptions[0].textContent} template applied.`;
  });
  buildControls();

  toggle.addEventListener("click", () => setOpen(true));
  close.addEventListener("click", () => setOpen(false));

  show.addEventListener("click", () => {
    code.hidden = !code.hidden;
    code.value = exportCode();
    show.textContent = code.hidden ? "Show code" : "Hide code";
  });

  root.querySelector(".capillary-copy").addEventListener("click", async () => {
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

  root.querySelector(".capillary-reset").addEventListener("click", () => {
    onReset();
    status.textContent = "A new channel network has been generated.";
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