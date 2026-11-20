/* Schema-driven settings editor for Game of Pi. */
(() => {
  "use strict";
  const element = (tag, text) => {
    const node = document.createElement(tag);
    if (text !== undefined)
      node.textContent = text;
    return node;
  };
  const read = (object, path) => path.split(".").reduce((value, key) => value?.[key], object);
  const write = (object, path, value) => {
    const keys = path.split(".");
    const key = keys.pop();
    for (const part of keys)
      object = object[part] ??= {};
    object[key] = value;
  };
  const isColor = value => typeof value === "string" && /^#(?:[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value);
  const clone = object => JSON.parse(JSON.stringify(object));
  function normalize(field, value, fallback) {
    switch (field.type) {
      case "boolean": return typeof value === "boolean" ? value : fallback;
      case "select": return Object.hasOwn(field.options, value) ? value : fallback;
      case "color": return isColor(value) ? value.toUpperCase() : fallback;
      case "range": {
        if (typeof value !== "number" || !Number.isFinite(value))
          return fallback;
        const bounded = Math.min(field.max, Math.max(field.min, value));
        if (field.continuous)
          return bounded;
        return Number((field.min + Math.round((bounded - field.min) / field.step) * field.step).toFixed(6));
      }
      default: return fallback;
    }
  }
  window.createSettingsEditor = ({ root, defaults, presets, sections, storageKey, onChange, onRestart, onPause }) => {
    const fields = sections.flatMap(section => section.groups.flatMap(group => group.fields));
    const sanitize = (input, base = defaults) => {
      const result = clone(base);
      for (const field of fields) {
        write(result, field.path, normalize(field, read(input, field.path), read(base, field.path)));
      }
      return result;
    };
    let config = clone(defaults);
    let remembered = Object.keys(presets)[0] || "";
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (saved?.config) {
        config = sanitize(saved.config);
        remembered = saved.preset || "";
      }
    }
    catch {
      // The editor also works when browser storage is unavailable.
    }
    const button = (text, action) => {
      const node = element("button", text);
      node.type = "button";
      node.addEventListener("click", action);
      return node;
    };
    const open = button("Settings", () => setOpen(panel.hidden));
    open.className = "settings-open";
    open.setAttribute("aria-controls", "pi-settings");
    const panel = element("aside");
    panel.className = "settings-panel";
    panel.id = "pi-settings";
    panel.setAttribute("aria-label", "Game of Pi settings");
    const header = element("header");
    const title = element("div");
    title.append(element("small", "WEBGL BACKGROUNDS"), element("h1", "Game of Pi"));
    const close = button("×", () => setOpen(false, true));
    close.setAttribute("aria-label", "Close settings");
    header.append(title, close);
    const search = element("input");
    search.type = "search";
    search.placeholder = "Search settings…";
    search.setAttribute("aria-label", "Search settings");
    // Generate a fresh configuration from the schema every time Random is selected.
    // The schema is the single source of truth for allowed values.
    function randomConfiguration() {
      const result = clone(defaults);

      // Preserve the current background and all camera settings.
      write(result, "render.background", read(config, "render.background"));
      result.camera = clone(config.camera);

      for (const field of fields) {
        if (field.path === "render.background" || field.path.startsWith("camera.")) {
          continue;
        }

        let value;

        switch (field.type) {
          case "boolean":
            value = Math.random() < 0.5;
            break;

          case "select": {
            const choices = Object.keys(field.options);
            value = choices[Math.floor(Math.random() * choices.length)];
            break;
          }

          case "range": {
            const steps = Math.floor((field.max - field.min) / field.step);
            value = field.min + Math.floor(Math.random() * (steps + 1)) * field.step;
            value = Number(value.toFixed(6));
            break;
          }

          case "color": {
            const channels = Array.from({ length: 3 }, () =>
              Math.floor(Math.random() * 256)
                .toString(16)
                .padStart(2, "0")
            );
            const original = read(defaults, field.path);
            const alpha = original.length === 9 ? original.slice(7) : "";
            value = `#${channels.join("")}${alpha}`.toUpperCase();
            break;
          }

          default:
            continue;
        }

        write(result, field.path, normalize(field, value, read(defaults, field.path)));
      }

      // Random should produce a moving, visible visualization by default.
      result.simulation.paused = false;
      result.render.opacity = Math.max(0.3, result.render.opacity);
      result.render.lineWidth = Math.max(1, result.render.lineWidth);
      result.render.pointSize = Math.max(1, result.render.pointSize);
      result.ui.showStats = true;

      return result;
    }

    const preset = element("select");
    preset.setAttribute("aria-label", "Preset");
    preset.append(
      new Option("Custom", ""),
      new Option("Random", "__random__"),
      ...Object.keys(presets).map(name => new Option(name, name))
    );
    preset.value = Object.hasOwn(presets, remembered) ? remembered : "";
    preset.addEventListener("change", () => {
      if (preset.value === "__random__") {
        randomize();
      } else if (preset.value) {
        apply(sanitize(presets[preset.value]), preset.value);
      } else {
        save();
      }
    });
    const presetRow = element("div");
    presetRow.className = "settings-preset";
    const reroll = button("Reroll", () => randomize());
    reroll.title = "Generate a new random visualization";
    presetRow.append(element("span", "Preset"), preset, reroll);
    let paused = false;
    const pause = button("Pause", () => {
      paused = !paused;
      pause.textContent = paused ? "Resume" : "Pause";
      pause.setAttribute("aria-pressed", String(paused));
      onPause(paused);
    });
    pause.setAttribute("aria-pressed", "false");
    const actions = element("div");
    actions.className = "settings-actions";
    actions.append(pause, button("Restart flow", onRestart), button("Reset settings", () => {
      apply(clone(defaults), Object.keys(presets)[0]);
      onRestart();
      announce("Default settings restored.");
    }));
    const controls = element("div");
    controls.className = "settings-controls";
    const empty = element("p", "No enabled settings match your search.");
    const views = sections.map(section => {
      const details = element("details");
      details.open = Boolean(section.open);
      details.append(element("summary", section.label));
      const groups = section.groups.map(group => {
        const container = element("div");
        container.className = "settings-group";
        if (group.label && section.label !== "Features")
          container.append(element("h2", group.label));
        const rows = group.fields.map(field => {
          const row = element("div");
          row.className = "settings-row";
          const label = element("label", field.label);
          const id = "pi-" + field.path.replaceAll(".", "-");
          label.htmlFor = id;
          const description = field.help ? element("small", field.help) : null;
          if (description)
            description.id = id + "-help";
          const line = element("div");
          line.className = "settings-line";
          line.append(label);
          let input;
          let sync;
          const update = value => {
            write(config, field.path, normalize(field, value, read(config, field.path)));
            preset.value = "";
            sync();
            filter();
            onChange(config, field.path);
            save();
          };
          if (field.type === "range") {
            input = element("input");
            input.type = "range";
            Object.assign(input, { min: field.min, max: field.max, step: field.step });
            const value = element("output");
            value.htmlFor = id;
            line.append(value);
            input.addEventListener("input", () => update(input.valueAsNumber));
            sync = () => {
              input.value = read(config, field.path);
              value.textContent = input.value + (field.unit || "");
            };
            row.append(line, input);
          }
          else if (field.type === "color") {
            input = element("input");
            input.type = "text";
            input.maxLength = 9;
            input.spellcheck = false;
            input.size = 10;
            const swatch = element("input");
            swatch.type = "color";
            swatch.setAttribute("aria-label", field.label + " color picker");
            input.addEventListener("change", () => {
              const value = input.value.trim();
              if (isColor(value))
                update(value);
              else {
                sync();
                announce("Use #RRGGBB or #RRGGBBAA.");
              }
            });
            swatch.addEventListener("input", () => update(swatch.value + read(config, field.path).slice(7)));
            sync = () => {
              input.value = read(config, field.path);
              swatch.value = input.value.slice(0, 7);
            };
            const pair = element("div");
            pair.className = "settings-color";
            pair.append(swatch, input);
            line.append(pair);
            row.append(line);
          }
          else if (field.type === "select") {
            input = element("select");
            for (const [value, label] of Object.entries(field.options))
              input.append(new Option(label, value));
            input.addEventListener("change", () => update(input.value));
            sync = () => { input.value = read(config, field.path); };
            line.append(input);
            row.append(line);
          }
          else {
            input = element("input");
            input.type = "checkbox";
            input.addEventListener("change", () => update(input.checked));
            sync = () => { input.checked = read(config, field.path); };
            line.append(input);
            row.append(line);
          }
          input.id = id;
          if (description) {
            input.setAttribute("aria-describedby", description.id);
            row.append(description);
          }
          container.append(row);
          return { field, row, sync };
        });
        if (section.label === "Features") {
          const featureDetails = element("details");
          featureDetails.className = "settings-feature";
          featureDetails.open = false;
          featureDetails.append(element("summary", group.label), container);
          details.append(featureDetails);
          return { group, container, rows, featureDetails };
        }
        details.append(container);
        return { group, container, rows, featureDetails: null };
      });
      if (section.label === "Features") {
        const categoryElements = new Map();
        for (const item of groups) {
          const name = item.group.category;
          if (!categoryElements.has(name)) {
            const folder = element("details");
            folder.className = "settings-category";
            folder.append(element("summary", name));
            categoryElements.set(name, folder);
          }
          categoryElements.get(name).append(item.featureDetails);
        }
        details.replaceChildren(details.querySelector("summary"), ...categoryElements.values());
        for (const item of groups) {
          item.categoryDetails = categoryElements.get(item.group.category);
        }
      }
      controls.append(details);
      return { section, details, groups };
    });
    const status = element("p");
    status.className = "settings-status";
    status.setAttribute("role", "status");
    const stats = element("output");
    stats.className = "settings-stats";
    stats.hidden = true;
    const io = element("details");
    io.append(element("summary", "Import or export settings"));
    const json = element("textarea");
    json.rows = 5;
    json.placeholder = "Paste or copy settings JSON";
    json.setAttribute("aria-label", "Settings JSON");
    json.spellcheck = false;
    const ioActions = element("div");
    ioActions.className = "settings-actions";
    ioActions.append(button("Export", () => {
      json.value = JSON.stringify(config, null, 2);
      json.focus();
      json.select();
      announce("Settings JSON is selected and ready to copy.");
    }), button("Import", () => {
      try {
        const parsed = JSON.parse(json.value);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)
          || !fields.some(field => read(parsed, field.path) !== undefined))
          throw new Error();
        apply(sanitize(parsed, config), "");
        announce("Settings imported.");
      }
      catch {
        announce("Paste a JSON object containing Game of Pi settings.");
      }
    }));
    io.append(json, ioActions);
    panel.append(header, search, presetRow, actions, stats, controls, empty, io, status);
    root.append(open, panel);
    let priorOpen = null;
    function filter() {
      const terms = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      if (terms.length && !priorOpen)
        priorOpen = views.map(view => view.details.open);
      let any = false;
      for (const [index, view] of views.entries()) {
        let sectionVisible = false;
        for (const { group, container, rows, featureDetails } of view.groups) {
          let groupVisible = false;
          for (const { field, row } of rows) {
            const haystack = [view.section.label, group.label, field.label, field.path, field.help].join(" ").toLowerCase();
            const visible = (!field.when || field.when(config)) && terms.every(term => haystack.includes(term));
            row.hidden = !visible;
            groupVisible ||= visible;
          }
          container.hidden = !groupVisible;
          if (featureDetails) {
            featureDetails.hidden = !groupVisible;
            if (terms.length) featureDetails.open = groupVisible;
          }
          sectionVisible ||= groupVisible;
        }
        if (view.section.label === "Features") {
          const categories = new Map();
          for (const item of view.groups) {
            categories.set(
              item.categoryDetails,
              (categories.get(item.categoryDetails) || false) || !item.featureDetails.hidden
            );
          }
          for (const [categoryDetails, visible] of categories) {
            categoryDetails.hidden = !visible;
            if (terms.length) categoryDetails.open = visible;
          }
        }
        view.details.hidden = !sectionVisible;
        if (terms.length)
          view.details.open = sectionVisible;
        else if (priorOpen)
          view.details.open = priorOpen[index];
        any ||= sectionVisible;
      }
      if (!terms.length)
        priorOpen = null;
      empty.hidden = any;
      io.hidden = terms.length > 0;
    }
    function setOpen(visible, focus = false) {
      panel.hidden = !visible;
      open.hidden = visible;
      open.setAttribute("aria-expanded", String(visible));
      if (focus)
        open.focus();
    }
    function announce(message) { status.textContent = message; }
    function save() {
      try {
        localStorage.setItem(storageKey, JSON.stringify({ config, preset: preset.value }));
      }
      catch { /* Optional browser storage. */ }
    }
    function randomize() {
      apply(randomConfiguration(), "__random__");
      announce("New random visualization generated. Select Random again or click Reroll.");
    }

    function apply(next, name) {
      config = next;
      preset.value = name;
      syncAll();
      onChange(config, null);
      save();
    }
    function syncAll() {
      for (const view of views)
        for (const group of view.groups)
          for (const row of group.rows)
            row.sync();
      filter();
    }
    search.addEventListener("input", filter);
    document.addEventListener("keydown", event => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey)
        return;
      if (event.key === "Escape" && !panel.hidden)
        setOpen(false, true);
      if (event.key.toLowerCase() === "g" && !event.repeat
        && !event.target.closest?.("input, textarea, select, [contenteditable]")) {
        setOpen(panel.hidden);
      }
    });
    setOpen(!new URLSearchParams(location.search).has("embed") && window.innerWidth > 820);
    syncAll();
    return {
      config,
      commitChanges() {
        preset.value = "";
        syncAll();
        save();
      },
      setStats(message) {
        stats.hidden = !message;
        if (message && stats.textContent !== message)
          stats.textContent = message;
      }
    };
  };
  const nestedCss = document.createElement("style");
  nestedCss.textContent = `
    .settings-category { margin: 8px 0 8px 10px; border-left: 1px solid #37516a; padding-left: 9px; }
    .settings-category > summary { cursor: pointer; font-weight: 600; padding: 8px 5px; }
    .settings-feature { margin: 4px 0 4px 10px; border-left: 1px solid #263c54; padding-left: 8px; }
    .settings-feature > summary { cursor: pointer; padding: 7px 4px; font-weight: 500; }
    .settings-feature > .settings-group { margin: 4px 0 10px; }
    .settings-category[hidden], .settings-feature[hidden] { display: none !important; }
  `;
  document.head.append(nestedCss);
  const css = `.settings-open,.settings-panel{position:fixed;top:14px;right:14px;z-index:6}.settings-open{background:#16273c;color:#e5f5ff;border:1px solid #42617a;border-radius:10px;padding:10px}.settings-panel{width:min(360px,calc(100vw - 28px));max-height:calc(100dvh - 28px);overflow:auto;background:#0b1525f2;color:#e3f2ff;border:1px solid #344c67;border-radius:17px;padding:15px;box-shadow:0 12px 50px #0009;font:12px/1.5 system-ui,sans-serif;backdrop-filter:blur(14px)}.settings-panel header,.settings-line,.settings-preset{display:flex;align-items:center;justify-content:space-between;gap:8px}.settings-panel h1{font-size:20px;margin:3px 0 8px}.settings-panel header small{color:#85cfe8;letter-spacing:.15em;font-size:9px}.settings-panel button,.settings-panel select,.settings-panel input[type=search],.settings-panel input[type=text],.settings-panel textarea{background:#172941;color:#e9f6ff;border:1px solid #3a5772;border-radius:7px;padding:7px;font:inherit}.settings-panel input[type=search],.settings-panel textarea{width:100%;margin-top:10px}.settings-panel input[type=range]{width:100%;accent-color:#7de8ff}.settings-panel input[type=checkbox]{accent-color:#7de8ff}.settings-panel details{border-top:1px solid #263c55;margin-top:8px;padding-top:8px}.settings-panel summary{cursor:pointer;font-weight:650}.settings-group h2{font-size:12px}.settings-row{padding:7px 0}.settings-line output{color:#8de6ff}.settings-row small{display:block;color:#88a4c2}.settings-actions{display:flex;flex-wrap:wrap;gap:6px;margin:9px 0}.settings-preset{margin:12px 0}.settings-preset select{flex:1;min-width:0}.settings-color{display:flex;gap:6px}.settings-color input[type=text]{width:90px}.settings-status,.settings-stats{color:#9fc3d8;font-size:11px}.settings-panel textarea{min-height:100px;font:11px monospace}[hidden]{display:none!important}`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.append(style);
  const app = window.GameOfPi;
  if (!app)
    return;
  const PRESETS = {
    '01 · Neon Genesis': { features: { luminous: { enabled: true }, nebula: { enabled: true }, chromatic: { enabled: true }, nodes: { enabled: true } }, render: { colors: 'digit', bloom: true } },
    '02 · Pure Mathematics': { features: { luminous: { enabled: false }, nebula: { enabled: false }, nodes: { enabled: false }, chromatic: { enabled: false } }, render: { colors: 'mono', showGrid: true, bloom: false } },
    '03 · Rainbow Infinity': { render: { colors: 'time', trailFade: 0 }, features: { chromatic: { enabled: true }, echoes: { enabled: true }, interference: { enabled: true } } },
    '04 · Galactic Dust': { features: { nebula: { enabled: true, count: 12000, emission: 5 }, vortices: { enabled: true }, luminous: { enabled: true } } },
    '05 · Electric Storm': { features: { lightning: { enabled: true, frequency: 4 }, nodes: { enabled: true, every: 20 }, luminous: { enabled: true } } },
    '06 · Crystal Garden': { features: { crystals: { enabled: true, size: 12, threshold: 2 }, density: { enabled: true }, nebula: { enabled: false } } },
    '07 · Topographic Pi': { simulation: { grouping: 'triplet' }, camera: { threeD: true, tilt: 45 }, features: { density: { enabled: true, height: 55 }, extrusion: { enabled: true } } },
    '08 · Liquid Hologram': { simulation: { grouping: 'quadruplet', fourth: 'curvature' }, camera: { threeD: true, yaw: 30 }, features: { liquid: { enabled: true, strength: 2 }, lens: { enabled: true }, extrusion: { enabled: true }, echoes: { enabled: true } } },
    '09 · Temporal Mirrors': { simulation: { grouping: 'highResolution' }, camera: { threeD: true, yaw: 60 }, features: { echoes: { enabled: true, count: 6 }, interference: { enabled: true, layers: 5 }, chromatic: { enabled: true } } },
    '10 · Pi Multiverse': { simulation: { grouping: 'triplet', constant: 'phi' }, camera: { threeD: true }, features: { multiverse: { enabled: true, walkers: 6 }, lightning: { enabled: true }, nebula: { enabled: true } }, simulation: { mode: 'relative' } }
  };
  const SECTIONS = {
    'Simulation': { constant: ['select', ['pi', 'e', 'phi', 'sqrt2', 'ln2', 'champernowne'], 'Source of exact decimal digits'], grouping: ['select', ['single', 'pair', 'triplet', 'quadruplet', 'highResolution'], '1, 2, 3, 4 or 6 digits per movement'], interpretation: ['select', ['spherical', 'cartesian'], '3D spherical or XYZ movement'], fourth: ['select', ['roll', 'thickness', 'curvature', 'color'], 'Fourth digit effect: roll affects orientation; thickness affects brightness; curvature bends displayed segments; color changes hue'], zeroLength: ['select', ['zero', 'one', 'ten'], 'How a zero length digit behaves'], digitCount: ['number', 100, 1000000, 100, 'Number of decimal digits to calculate (100–1,000,000)'], mode: ['select', ['absolute', 'relative'], 'Direction interpretation'], digitsPerSecond: ['range', 1, 5000, 1, 'Steps calculated each second'], stepLength: ['range', .1, 20, .1, 'Distance of each digit step'], startDigit: ['number', 0, 4000, 1, 'Skip this many initial digits'], paused: ['bool', 'Pause simulation'], angleOffset: ['range', -180, 180, 1, 'Rotate all directions in degrees'], reverse: ['bool', 'Read the stored digit sequence backwards'], walkers: ['range', 1, 8, 1, 'Number of walkers when multiverse is disabled'] },
    'Camera': { autoZoom: ['bool', 'Automatically zoom out'], zoomSpeed: ['range', .01, 4, .01, 'Speed of automatic zoom'], follow: ['bool', 'Smoothly follow the path'], followStrength: ['range', .01, 10, .01, 'Camera tracking responsiveness'], mode: ['select', ['endpoint', 'bounds', 'origin'], 'Target for camera follow'], zoom: ['range', .1, 20, .1, 'Initial zoom after restart'], manualPause: ['range', 0, 20, .5, 'Seconds to suspend auto camera after manual input'], threeD: ['bool', 'Enable genuine 3D projection'], perspective: ['bool', 'Perspective projection'], yaw: ['range', -180, 180, 1, 'Rotate camera around vertical axis'], tilt: ['range', 0, 80, 1, 'Perspective-like tilt angle'] },
    'Rendering': { background: ['color', 'Canvas clear color'], lineWidth: ['range', .5, 8, .1, 'Line width (driver-dependent in WebGL)'], pointSize: ['range', .5, 10, .1, 'Particle size'], opacity: ['range', .05, 1, .01, 'Path opacity'], colors: ['select', ['digit', 'time', 'distance', 'mono'], 'How path colors are assigned'], trailFade: ['range', 0, 1, .01, 'Fade older path segments'], bloom: ['bool', 'Additive bloom approximation'], bloomStrength: ['range', 0, 3, .1, 'Glow multiplier'], showGrid: ['bool', 'Show infinite coordinate grid'] },
    'Node Aging & Fade': { enabled: ['bool', 'Fade older nodes and path segments'], halfLife: ['range', 1, 120, 1, 'Half-life in seconds of simulation progress'], minOpacity: ['range', 0, 1, .01, 'Minimum remaining opacity'] },
    'Luminous Trails': { enabled: ['bool', 'Enable energy trails'], glow: ['range', 0, 3, .1, 'Energy glow'] },
    'Particle Nebula': { enabled: ['bool', 'Enable cosmic dust'], count: ['range', 0, 12000, 100, 'Maximum active particles'], emission: ['range', .1, 10, .1, 'Particle emission rate'], drift: ['range', 0, 4, .05, 'Particle drift velocity'] },
    '3D Density Mountains': { enabled: ['bool', 'Enable height-map columns'], resolution: ['range', 1, 30, 1, 'Density cell size'], height: ['range', 1, 100, 1, 'Mountain height'], wireframe: ['bool', 'Wireframe mountain style'] },
    'Chromatic Digit Trails': { enabled: ['bool', 'Enable multicolor digit mapping'] },
    'Gravitational Lens': { enabled: ['bool', 'Enable density-based lens rings'], strength: ['range', 0, 3, .05, 'Lensing intensity'], radius: ['range', 1, 200, 1, 'Lensing radius'] },
    'Lightning Network': { enabled: ['bool', 'Enable electrical arcs'], distance: ['range', 1, 50, 1, 'Proximity threshold'], frequency: ['range', 1, 100, 1, 'Arc emission interval'] },
    'Liquid Light': { enabled: ['bool', 'Enable ripple effect'], strength: ['range', .1, 5, .1, 'Ripple amplitude'], decay: ['range', .1, 1, .01, 'Ripple persistence'] },
    'Holographic Extrusion': { enabled: ['bool', 'Enable holographic layering'], height: ['range', 1, 40, 1, 'Extrusion height'], thickness: ['range', .5, 10, .5, 'Ribbon thickness'] },
    'Temporal Echoes': { enabled: ['bool', 'Enable historical duplicates'], count: ['range', 1, 10, 1, 'Number of echoes'], offset: ['range', 1, 40, 1, 'Offset between echoes'], opacity: ['range', .01, 1, .01, 'Echo opacity'] },
    'Energy Nodes': { enabled: ['bool', 'Enable periodic energy nodes'], every: ['range', 1, 1000, 1, 'Digits between nodes'], radius: ['range', 1, 15, 1, 'Node radius'] },
    'Infinite Zoom': { enabled: ['bool', 'Adaptive infinite zoom'] },
    'Interference & Moiré': { enabled: ['bool', 'Enable overlapping path copies'], layers: ['range', 1, 10, 1, 'Interference layers'], angle: ['range', 0, 30, .5, 'Angular separation'], offset: ['range', 1, 30, 1, 'Layer offset'] },
    'Black Hole Vortices': { enabled: ['bool', 'Enable density vortices'], strength: ['range', .1, 5, .1, 'Vortex radius multiplier'] },
    'Crystalline Growth': { enabled: ['bool', 'Enable intersection crystals'], size: ['range', 1, 30, 1, 'Crystal size'], threshold: ['range', 2, 20, 1, 'Visits needed to form a crystal'] },
    'Spectral Frequency Waves': { enabled: ['bool', 'Show digit frequency spectrum'], window: ['range', 10, 2000, 10, 'Analysis window (reserved)'] },
    'Pi Multiverse': { enabled: ['bool', 'Enable multiple walkers'], walkers: ['range', 2, 10, 1, 'Parallel walkers'], spread: ['range', 0, 90, 1, 'Angular divergence'] },
    'Performance': { maxVisibleSegments: ['range', 10000, 400000, 10000, 'Maximum visible line segments'], chunkSize: ['range', 512, 16384, 512, 'Storage trim chunk size'], maxStoredSteps: ['range', 100000, 3000000, 100000, 'Maximum retained path points'], particleCap: ['range', 100, 15000, 100, 'Particle budget'] },
    'Interface': { showStats: ['bool', 'Show statistics'], showHelp: ['bool', 'Show keyboard hints'] }
  };
  const groupPath = { Simulation: 'simulation', Camera: 'camera', Rendering: 'render', Performance: 'performance', Interface: 'ui' };
  const featurePaths = { 'Node Aging & Fade': 'nodeFade', 'Luminous Trails': 'luminous', 'Particle Nebula': 'nebula', '3D Density Mountains': 'density', 'Chromatic Digit Trails': 'chromatic', 'Gravitational Lens': 'lens', 'Lightning Network': 'lightning', 'Liquid Light': 'liquid', 'Holographic Extrusion': 'extrusion', 'Temporal Echoes': 'echoes', 'Energy Nodes': 'nodes', 'Infinite Zoom': 'fractal', 'Interference & Moiré': 'interference', 'Black Hole Vortices': 'vortices', 'Crystalline Growth': 'crystals', 'Spectral Frequency Waves': 'spectral', 'Pi Multiverse': 'multiverse' };
  const pathFor = s => groupPath[s] ? [groupPath[s]] : ['features', featurePaths[s]];
  // Feature categories define the three-level hierarchy:
  // Features -> category -> individual feature.
  const FEATURE_CATEGORIES = {
    "Trails & Light": [
      "Luminous Trails", "Chromatic Digit Trails", "Lightning Network",
      "Energy Nodes", "Node Aging & Fade"
    ],
    "Particles & Space": [
      "Particle Nebula", "Black Hole Vortices", "Gravitational Lens"
    ],
    "Geometry & Structures": [
      "3D Density Mountains", "Holographic Extrusion", "Crystalline Growth"
    ],
    "Distortion & Interference": [
      "Liquid Light", "Interference & Moiré", "Temporal Echoes"
    ],
    "Mathematics & Multiverse": [
      "Infinite Zoom", "Spectral Frequency Waves", "Pi Multiverse"
    ]
  };

  function makeFields(label, definitions) {
    return Object.entries(definitions).map(([name, spec]) => {
      const [kind, ...args] = spec;
      const path = [...pathFor(label), name].join(".");
      const type = kind === "bool" ? "boolean" : kind === "number" ? "range" : kind;
      const field = {
        path,
        label: name.replace(/([A-Z])/g, " $1").replace(/^./, x => x.toUpperCase()),
        type
      };

      if (type === "range") {
        field.min = args[0];
        field.max = args[1];
        field.step = args[2];
        field.help = args[3];
      } else if (type === "select") {
        field.options = Object.fromEntries(
          args[0].map(value => [value, value.replace(/^./, letter => letter.toUpperCase())])
        );
        field.help = args[1];
      } else {
        field.help = args[0];
      }

      if (path === "simulation.interpretation") {
        field.when = config => ["triplet", "quadruplet", "highResolution"]
          .includes(config.simulation.grouping);
      }
      if (path === "simulation.fourth") {
        field.when = config => config.simulation.grouping === "quadruplet";
      }
      if (path === "simulation.zeroLength") {
        field.when = config => ["pair", "triplet", "quadruplet"]
          .includes(config.simulation.grouping);
      }
      if (path.startsWith("features.") && name !== "enabled") {
        field.when = config => config.features[path.split(".")[1]].enabled;
      }
      return field;
    });
  }

  const sections = Object.entries(SECTIONS)
    .filter(([label]) => Object.hasOwn(groupPath, label))
    .map(([label, definitions]) => ({
      label,
      open: ["Simulation", "Camera", "Rendering"].includes(label),
      groups: [{ label: "", fields: makeFields(label, definitions) }]
    }));

  // Each category is a collapsible folder under Features. Its individual
  // feature folders are rendered as nested details elements below.
  const featureSections = Object.entries(FEATURE_CATEGORIES).map(([category, names]) => ({
    label: category,
    open: false,
    groups: names.map(name => ({
      label: name,
      fields: makeFields(name, SECTIONS[name])
    }))
  }));

  sections.splice(3, 0, {
    label: "Features",
    open: false,
    groups: featureSections.flatMap(category => category.groups.map(group => ({
      ...group,
      category: category.label
    })))
  });

  function mergedPreset(patch) {
    const out = JSON.parse(JSON.stringify(app.defaults)); const apply = (a, b) => {
      for (const [k, v] of Object.entries(b)) {
        if (v && typeof v === 'object' && !Array.isArray(v))
          apply(a[k], v);
        else
          a[k] = v;
      }
    }; apply(out, patch); return out;
  }
  const presets = Object.fromEntries(Object.entries(PRESETS).map(([name, patch]) => [name, mergedPreset(patch)]));
  const editor = window.createSettingsEditor({
    root: document.getElementById('editor-root'), defaults: app.defaults, presets, sections, storageKey: 'game-of-pi-editor-v2', onChange: (next, path) => {
      const restart = path === null || ['simulation.constant', 'simulation.grouping', 'simulation.interpretation', 'simulation.fourth', 'simulation.zeroLength', 'simulation.mode', 'simulation.startDigit', 'simulation.reverse', 'simulation.walkers', 'features.multiverse.enabled', 'features.multiverse.walkers'].includes(path);
      app.applyConfig(next, restart);
    }, onRestart: () => app.restart(), onPause: paused => { app.config.simulation.paused = paused; app.applyConfig(app.config); }
  });
  // Main-screen transport remains the authoritative pause/reset control.
  window.GameOfPi.editor = editor;
  app.applyConfig(editor.config);
})();
