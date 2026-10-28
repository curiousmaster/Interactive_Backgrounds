
export function createSettingsEditor({
  config,
  defaults,
  onChange = () => {},
  onReset = () => {},
  onPreset = () => {}
}) {
  // ============================================================
  // NUMERIC SETTING LIMITS
  // ============================================================

  const limits = {
    "tiles.size": [12, 90, 1],
    "tiles.spacing": [0, 35, 1],
    "tiles.sizeVariation": [0, 0.6, 0.01],
    "tiles.thickness": [0.5, 25, 0.5],
    "tiles.bevel": [0, 0.5, 0.01],
    "tiles.morph": [0, 1, 0.01],
    "tiles.opacity": [0.1, 1, 0.01],
    "tiles.edgeOpacity": [0, 2, 0.05],
    "tiles.edgeWidth": [0.01, 0.3, 0.01],
    "tiles.heroChance": [0, 0.2, 0.005],
    "tiles.heroScale": [1, 3, 0.05],
    "tiles.personality": [0, 2, 0.05],

    "camera.tiltX": [-60, 60, 1],
    "camera.tiltY": [-60, 60, 1],
    "camera.perspective": [400, 1600, 10],
    "camera.zoom": [0.5, 8, 0.1],
    "camera.minZoom": [0.5, 4, 0.1],
    "camera.maxZoom": [1, 8, 0.1],
    "camera.parallax": [0, 80, 1],
    "camera.depth": [0, 150, 1],
    "camera.orbitSpeed": [0, 1, 0.01],

    "materials.metallic": [0, 1, 0.01],
    "materials.roughness": [0, 1, 0.01],
    "materials.glass": [0, 1, 0.01],
    "materials.iridescence": [0, 1, 0.01],
    "materials.fresnel": [0, 2, 0.05],
    "materials.backContrast": [0, 1, 0.01],
    "materials.environment": [0, 2, 0.05],

    "lighting.directionX": [-1, 1, 0.05],
    "lighting.directionY": [-1, 1, 0.05],
    "lighting.directionZ": [-1, 1, 0.05],
    "lighting.intensity": [0, 3, 0.05],
    "lighting.ambient": [0, 1, 0.01],
    "lighting.specular": [0, 4, 0.05],
    "lighting.glintStrength": [0, 3, 0.05],

    "motion.drift": [0, 150, 1],
    "motion.speed": [0, 3, 0.01],
    "motion.assemblySpeed": [0.1, 12, 0.1],
    "motion.separation": [0, 1, 0.01],
    "motion.cycleDuration": [3, 60, 1],
    "motion.rotation": [0, 180, 1],
    "motion.breathing": [0, 2, 0.05],
    "motion.explodeStrength": [0, 300, 5],
    "motion.dominoSpeed": [0, 6, 0.1],

    "physics.radius": [30, 500, 5],
    "physics.displacement": [0, 300, 5],
    "physics.rotation": [0, 180, 1],
    "physics.stiffness": [1, 100, 1],
    "physics.damping": [1, 25, 0.5],
    "physics.waveSpeed": [50, 700, 10],
    "physics.shockStrength": [0, 250, 5],
    "physics.gravityStrength": [0, 250, 5],

    "colors.scale": [80, 1000, 10],
    "colors.speed": [0, 2, 0.01],
    "colors.flowStrength": [0, 2, 0.05],
    "colors.heightInfluence": [0, 1, 0.05],

    "atmosphere.haze": [0, 1, 0.01],
    "atmosphere.dustCount": [0, 500, 10],
    "atmosphere.dustOpacity": [0, 1, 0.01],
    "atmosphere.bloomStrength": [0, 2, 0.05],
    "atmosphere.bloomThreshold": [0, 2, 0.05],
    "atmosphere.dofStrength": [0, 1, 0.01],
    "atmosphere.vignette": [0, 1, 0.01],
    "atmosphere.grain": [0, 0.2, 0.005],
    "atmosphere.aberration": [0, 0.01, 0.0005],
    "atmosphere.trailPersistence": [0, 1, 0.01],

    "effects.fractureIntensity": [0, 2, 0.05],
    "effects.connectionDistance": [1, 3, 0.1],
    "effects.portalRadius": [30, 400, 5],
    "effects.portalStrength": [0, 2, 0.05],
    "effects.scanSpeed": [0, 2, 0.05],

    "animation.speed": [0, 3, 0.05],
    "animation.maxDpr": [0.5, 3, 0.25],
    "animation.maxFps": [15, 120, 5]
  };

  // ============================================================
  // SELECT OPTIONS
  // ============================================================

  const options = {
    "tiles.shape": [
      "square",
      "hexagon",
      "triangle"
    ],

    "camera.mode": [
      "perspective",
      "orthographic"
    ],

    "materials.type": [
      "satin",
      "metal",
      "glass",
      "ceramic",
      "iridescent"
    ],

    "motion.mode": [
      "wave",
      "magnetic",
      "explosion",
      "vortex",
      "domino",
      "classic",
      "breathing"
    ],

    "animation.quality": [
      "auto",
      "high",
      "medium",
      "low"
    ]
  };

  // ============================================================
  // SETTING DESCRIPTIONS
  // ============================================================

  const hints = {
    "tiles.morph":
      "Morphs the square silhouette toward the selected polygon. " +
      "The tile layout remains a rectangular grid.",

    "tiles.bevel":
      "Controls the width of real beveled polygon edges.",

    "camera.parallax":
      "Camera parallax range. Disabled when camera parallax is not implemented.",

    "materials.type":
      "Selects a distinct shader material response.",

    "materials.backContrast":
      "Controls the contrasting color on the underside of tiles.",

    "motion.assemblySpeed":
      "Scales spring stiffness and assembly response.",

    "physics.wavePropagation":
      "Use narrow expanding shockwave bands.",

    "atmosphere.haze":
      "Mixes atmospheric haze into the final image.",

    "atmosphere.trails":
      "Trails toggle (reserved for a temporal accumulation pass).",

    "atmosphere.trailPersistence":
      "Persistence for temporal trails (reserved).",

    "effects.lightTrails":
      "Optional luminous trail layer (not currently active).",

    "effects.scanSpeed":
      "Scan animation speed (current shader uses a fixed scan rate).",

    "animation.quality":
      "Sets rendering resolution: low, medium, high or auto."
  };

  // ============================================================
  // SETTINGS PANEL STYLES
  // ============================================================

  const css = `
    .tessera-editor {
      position: fixed;
      inset: 0;
      z-index: 1000;
      pointer-events: none;
      color: #e7edf8;
      font: 13px/1.5 system-ui, sans-serif;
      color-scheme: dark;
    }

    .tessera-editor * {
      box-sizing: border-box;
    }

    .tessera-editor button,
    .tessera-editor input,
    .tessera-editor select,
    .tessera-editor textarea {
      font: inherit;
    }

    .tessera-editor button {
      background: #263248;
      color: #e7edf8;
      border: 1px solid #ffffff35;
      border-radius: 7px;
      padding: 7px 10px;
      cursor: pointer;
    }

    .tessera-editor button:hover {
      background: #3b4c69;
    }

    .tessera-editor :focus-visible {
      outline: 2px solid #9fd7ff;
      outline-offset: 2px;
    }

    .tessera-toggle {
      position: absolute;
      right: 15px;
      top: 15px;
      pointer-events: auto;
    }

    .tessera-panel {
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      width: min(390px, 100vw);
      padding: 18px;
      overflow: auto;
      background: #0c1422f5;
      border-left: 1px solid #ffffff26;
      backdrop-filter: blur(16px);
      pointer-events: auto;
      transform: translateX(100%);
      transition: transform 0.2s ease;
    }

    .tessera-panel.open {
      transform: translateX(0);
    }

    .tessera-heading {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }

    .tessera-heading h2 {
      margin: 0;
      font-size: 18px;
    }

    .tessera-description,
    .tessera-status {
      font-size: 12px;
      color: #a8b7cb;
    }

    .tessera-description {
      margin: 9px 0 15px;
    }

    .tessera-panel details {
      margin: 0 0 9px;
      border: 1px solid #ffffff20;
      border-radius: 8px;
      background: #ffffff05;
      overflow: visible;
    }

    .tessera-panel summary {
      padding: 11px 12px;
      cursor: pointer;
      font-weight: 650;
      color: #bcd8ed;
      user-select: none;
    }

    .tessera-panel details[open] summary {
      border-bottom: 1px solid #ffffff1c;
    }

    .tessera-fields {
      padding: 12px;
    }

    .tessera-control {
      position: relative;
      margin-bottom: 13px;
    }

    .tessera-control:last-child {
      margin-bottom: 0;
    }

    .tessera-control-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 5px;
    }

    .tessera-control input[type="range"] {
      width: 100%;
      accent-color: #9dcbea;
    }

    .tessera-control input[type="number"],
    .tessera-control select {
      background: #111d30;
      color: inherit;
      border: 1px solid #ffffff30;
      border-radius: 5px;
      padding: 4px 6px;
      min-width: 0;
    }

    .tessera-control input[type="number"] {
      width: 82px;
    }

    .tessera-control select {
      max-width: 165px;
    }

    .tessera-control input[type="checkbox"] {
      accent-color: #a8d4f0;
    }

    .tessera-colors {
      display: flex;
      gap: 5px;
      align-items: center;
    }

    .tessera-colors input[type="color"] {
      width: 42px;
      height: 30px;
      background: transparent;
      border: 0;
      padding: 0;
    }

    .tessera-colors input[type="number"] {
      width: 56px;
    }

    .tessera-hint {
      position: absolute;
      right: calc(100% + 29px);
      top: 0;
      width: 260px;
      background: #17283e;
      color: #d9e9f8;
      border: 1px solid #6b9cc0;
      border-radius: 7px;
      padding: 11px;
      box-shadow: 0 10px 35px #0008;
      display: none;
      pointer-events: none;
      z-index: 10;
    }

    .tessera-control:hover .tessera-hint,
    .tessera-control:focus-within .tessera-hint {
      display: block;
    }

    .tessera-actions {
      display: flex;
      gap: 7px;
      flex-wrap: wrap;
      margin: 12px 0;
    }

    .tessera-code {
      display: block;
      width: 100%;
      height: 250px;
      background: #07101d;
      color: #d5e4f1;
      border: 1px solid #ffffff30;
      border-radius: 7px;
      padding: 9px;
      font: 11px/1.5 ui-monospace, monospace !important;
      resize: vertical;
    }

    .tessera-status {
      min-height: 20px;
    }

    .tessera-presets {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 10px 0 16px;
    }

    @media (max-width: 950px) {
      .tessera-hint {
        right: 0;
        top: calc(100% + 4px);
        width: min(260px, 90%);
        background: #233850;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .tessera-panel {
        transition: none;
      }
    }
  `;

  // ============================================================
  // INJECT STYLES
  // ============================================================

  const style = document.createElement("style");

  style.textContent = css;

  document.head.append(style);

  // ============================================================
  // CREATE EDITOR
  // ============================================================

  const root = document.createElement("div");

  root.className = "tessera-editor";
  root.dataset.backgroundEditor = "";

  root.innerHTML = `
    <button
      class="tessera-toggle"
      type="button"
    >
      Settings
    </button>

    <aside
      class="tessera-panel"
      aria-label="Floating Tesserae settings"
      inert
    >
      <div class="tessera-heading">
        <h2>Floating Tesserae</h2>

        <button
          class="tessera-close"
          type="button"
        >
          Close
        </button>
      </div>

      <p class="tessera-description">
        WebGL2 cinematic mosaic. Every group is collapsible.
        Hover over a setting for its description.
      </p>

      <div class="tessera-presets"></div>

      <div class="tessera-controls"></div>

      <div class="tessera-actions">
        <button class="tessera-new">
          New mosaic
        </button>

        <button class="tessera-copy">
          Copy config
        </button>

        <button class="tessera-show">
          Show code
        </button>

        <button class="tessera-defaults">
          Reset defaults
        </button>
      </div>

      <textarea
        class="tessera-code"
        readonly
        spellcheck="false"
        hidden
      ></textarea>

      <div
        class="tessera-status"
        role="status"
        aria-live="polite"
      ></div>
    </aside>
  `;

  document.body.append(root);

  const panel = root.querySelector(
    ".tessera-panel"
  );

  const toggle = root.querySelector(
    ".tessera-toggle"
  );

  const controls = root.querySelector(
    ".tessera-controls"
  );

  const status = root.querySelector(
    ".tessera-status"
  );

  const code = root.querySelector(
    ".tessera-code"
  );

  const show = root.querySelector(
    ".tessera-show"
  );

  // ============================================================
  // HELPERS
  // ============================================================

  const title = value =>
    value
      .replace(/([A-Z])/g, " $1")
      .replace(
        /^./,
        character => character.toUpperCase()
      );

  const toHex = color =>
    "#" +
    color
      .map(value =>
        Math.round(value)
          .toString(16)
          .padStart(2, "0")
      )
      .join("");

  const exportCode = () =>
    `const default = ${JSON.stringify(config, null, 2)};`;

  // ============================================================
  // SETTINGS CHANGE HANDLING
  // ============================================================

  function changed() {
    code.value = exportCode();

    onChange();

    refreshDependencies();
  }

  // ============================================================
  // CONDITIONAL SETTINGS
  // ============================================================

  function refreshDependencies() {
    for (
      const control of
      controls.querySelectorAll(
        "[data-setting-path]"
      )
    ) {
      const path = control.dataset.settingPath;

      const [section, key] = path.split(".");

      let reason = "";

      if (
        section === "atmosphere" &&
        key !== "enabled" &&
        !config.atmosphere.enabled
      ) {
        reason = "Atmosphere is disabled";
      }

      if (
        section === "colors" &&
        key === "flowStrength" &&
        !config.colors.flow
      ) {
        reason = "Enable Color Flow";
      }

      if (
        section === "physics" &&
        key === "gravityStrength" &&
        !config.physics.gravityWells
      ) {
        reason = "Enable Gravity Wells";
      }

      if (
        section === "lighting" &&
        key === "glintStrength" &&
        !config.lighting.glints
      ) {
        reason = "Enable Glints";
      }

      if (
        section === "camera" &&
        key === "perspective" &&
        config.camera.mode === "orthographic"
      ) {
        reason =
          "Perspective is inactive in orthographic mode";
      }

      control.style.opacity = reason ? "0.5" : "1";

      control.title = reason;
    }
  }

  // ============================================================
  // PANEL OPEN / CLOSE
  // ============================================================

  function setOpen(open) {
    panel.classList.toggle(
      "open",
      open
    );

    panel.inert = !open;

    toggle.hidden = open;

    if (open) {
      root.querySelector(
        ".tessera-close"
      ).focus();
    } else {
      toggle.focus();
    }
  }

  // ============================================================
  // ELEMENT HELPER
  // ============================================================

  function el(tag, className) {
    const element = document.createElement(tag);

    if (className) {
      element.className = className;
    }

    return element;
  }

  // ============================================================
  // CONTROL BINDINGS
  // ============================================================

  const bindings = [];

  // ============================================================
  // BUILD ALL SETTINGS
  // ============================================================

  function build() {
    controls.replaceChildren();

    bindings.length = 0;

    for (
      const [groupName, group] of
      Object.entries(config)
    ) {
      const details = el("details");

      if (
        ["tiles", "camera"].includes(groupName)
      ) {
        details.open = true;
      }

      const summary = el("summary");

      summary.textContent = title(groupName);

      details.append(summary);

      const fields = el(
        "div",
        "tessera-fields"
      );

      for (
        const [key, value] of
        Object.entries(group)
      ) {
        const path = groupName + "." + key;

        const control = el(
          "div",
          "tessera-control"
        );

        const head = el(
          "div",
          "tessera-control-title"
        );

        const label = el("label");

        const id =
          "tessera-" +
          groupName +
          "-" +
          key;

        label.textContent = title(key);
        label.htmlFor = id;

        head.append(label);
        control.append(head);

        control.dataset.settingPath = path;

        // --------------------------------------------------------
        // HOVER HELP
        // --------------------------------------------------------

        const hint = el(
          "div",
          "tessera-hint"
        );

        hint.textContent =
          hints[path] ||
          (
            title(key) +
            " — adjust the " +
            title(groupName).toLowerCase() +
            " effect. Changes are applied live."
          );

        control.append(hint);

        // --------------------------------------------------------
        // BOOLEAN SETTINGS
        // --------------------------------------------------------

        if (typeof value === "boolean") {
          const input = el("input");

          input.type = "checkbox";
          input.id = id;
          input.checked = value;

          input.addEventListener(
            "change",
            () => {
              group[key] = input.checked;

              changed();
            }
          );

          head.append(input);

          bindings.push(() => {
            input.checked = group[key];
          });
        }

        // --------------------------------------------------------
        // RGB COLOR SETTINGS
        // --------------------------------------------------------

        else if (Array.isArray(value)) {
          const row = el(
            "div",
            "tessera-colors"
          );

          const picker = el("input");

          picker.type = "color";
          picker.id = id;
          picker.value = toHex(value);

          row.append(picker);

          const channels = value.map(
            (channel, index) => {
              const input = el("input");

              input.type = "number";
              input.min = 0;
              input.max = 255;
              input.step = 1;
              input.value = channel;

              input.setAttribute(
                "aria-label",
                `${title(key)} ${
                  ["red", "green", "blue"][index]
                }`
              );

              input.addEventListener(
                "input",
                () => {
                  if (input.value === "") {
                    return;
                  }

                  const number = Number(
                    input.value
                  );

                  if (!Number.isFinite(number)) {
                    return;
                  }

                  group[key][index] = Math.max(
                    0,
                    Math.min(
                      255,
                      Math.round(number)
                    )
                  );

                  picker.value = toHex(
                    group[key]
                  );

                  changed();
                }
              );

              row.append(input);

              return input;
            }
          );

          picker.addEventListener(
            "input",
            () => {
              group[key] = [1, 3, 5].map(
                index =>
                  parseInt(
                    picker.value.slice(
                      index,
                      index + 2
                    ),
                    16
                  )
              );

              channels.forEach(
                (channel, index) => {
                  channel.value =
                    group[key][index];
                }
              );

              changed();
            }
          );

          bindings.push(() => {
            picker.value = toHex(
              group[key]
            );

            channels.forEach(
              (channel, index) => {
                channel.value =
                  group[key][index];
              }
            );
          });

          control.append(row);
        }

        // --------------------------------------------------------
        // NUMERIC SETTINGS
        // --------------------------------------------------------

        else if (typeof value === "number") {
          const [min, max, step] =
            limits[path] || [0, 100, 1];

          const numberInput = el("input");
          const rangeInput = el("input");

          numberInput.type = "number";
          rangeInput.type = "range";

          numberInput.id = id;

          for (
            const input of [
              numberInput,
              rangeInput
            ]
          ) {
            input.min = min;
            input.max = max;
            input.step = step;
            input.value = value;

            input.addEventListener(
              "input",
              () => {
                if (input.value === "") {
                  return;
                }

                let number = Number(
                  input.value
                );

                if (!Number.isFinite(number)) {
                  return;
                }

                number = Math.max(
                  min,
                  Math.min(max, number)
                );

                group[key] = Number(
                  (
                    min +
                    Math.round(
                      (number - min) / step
                    ) * step
                  ).toFixed(6)
                );

                numberInput.value =
                  rangeInput.value =
                    group[key];

                changed();
              }
            );
          }

          head.append(numberInput);
          control.append(rangeInput);

          bindings.push(() => {
            numberInput.value =
              rangeInput.value =
                group[key];
          });
        }

        // --------------------------------------------------------
        // SELECT SETTINGS
        // --------------------------------------------------------

        else if (typeof value === "string") {
          const select = el("select");

          select.id = id;

          for (
            const option of
            options[path] || [value]
          ) {
            const element = el("option");

            element.value = option;
            element.textContent = option;

            select.append(element);
          }

          select.value = value;

          select.addEventListener(
            "change",
            () => {
              group[key] = select.value;

              changed();
            }
          );

          head.append(select);

          bindings.push(() => {
            select.value = group[key];
          });
        }

        fields.append(control);
      }

      details.append(fields);
      controls.append(details);
    }
  }

  // ============================================================
  // REFRESH ALL CONTROLS
  // ============================================================

  function sync() {
    for (const binding of bindings) {
      binding();
    }

    changed();
  }

  // ============================================================
  // PRESET BUTTONS
  // ============================================================

  for (
    const name of [
      "classic",
      "cinematic",
      "chaos",
      "portal"
    ]
  ) {
    const button = el("button");

    button.textContent = title(name);

    button.addEventListener(
      "click",
      () => {
        onPreset(name);

        sync();

        status.textContent =
          `${title(name)} preset applied.`;
      }
    );

    root.querySelector(
      ".tessera-presets"
    ).append(button);
  }

  // ============================================================
  // NEW MOSAIC
  // ============================================================

  root.querySelector(
    ".tessera-new"
  ).addEventListener(
    "click",
    () => {
      onReset();

      status.textContent =
        "New mosaic generated.";
    }
  );

  // ============================================================
  // RESET DEFAULTS
  // ============================================================

  root.querySelector(
    ".tessera-defaults"
  ).addEventListener(
    "click",
    () => {
      for (
        const key of Object.keys(config)
      ) {
        Object.assign(
          config[key],
          structuredClone(defaults[key])
        );
      }

      sync();
      onReset();

      status.textContent =
        "Defaults restored.";
    }
  );

  // ============================================================
  // COPY CONFIGURATION
  // ============================================================

  root.querySelector(
    ".tessera-copy"
  ).addEventListener(
    "click",
    async () => {
      code.value = exportCode();

      try {
        await navigator.clipboard.writeText(
          code.value
        );

        status.textContent =
          "Configuration copied.";
      } catch {
        code.hidden = false;
        code.focus();
        code.select();

        status.textContent =
          "Select and copy the configuration.";
      }
    }
  );

  // ============================================================
  // SHOW / HIDE CONFIGURATION CODE
  // ============================================================

  show.addEventListener(
    "click",
    () => {
      code.hidden = !code.hidden;
      code.value = exportCode();

      show.textContent = code.hidden
        ? "Show code"
        : "Hide code";
    }
  );

  // ============================================================
  // PANEL BUTTONS
  // ============================================================

  toggle.addEventListener(
    "click",
    () => setOpen(true)
  );

  root.querySelector(
    ".tessera-close"
  ).addEventListener(
    "click",
    () => setOpen(false)
  );

  // ============================================================
  // KEYBOARD SHORTCUTS
  // ============================================================

  const keydown = event => {
    if (
      event.key === "Escape" &&
      panel.classList.contains("open")
    ) {
      setOpen(false);
    }
  };

  document.addEventListener(
    "keydown",
    keydown
  );

  // ============================================================
  // INITIALIZE
  // ============================================================

  build();

  code.value = exportCode();

  refreshDependencies();

  // ============================================================
  // CLEANUP API
  // ============================================================

  return {
    destroy() {
      document.removeEventListener(
        "keydown",
        keydown
      );

      root.remove();
      style.remove();
    }
  };
}
