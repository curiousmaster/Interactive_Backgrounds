"use strict";

window.mountSnowflakeSettings = function ({ config, button, onChange, onImage }) {
  const original = structuredClone(config);
  const effect = (name, help) => ({
    enabled: [name, null, help],
    strength: ["Strength", [0,1,0.01], help]
  });
  let imageName = "";
  const schema = {
    simulation: {
      mode: ["View mode", ["2D", "3D"], "Koch snowflakes or solids inside a sphere."],
      levels: ["Levels", [1,30,1], "Up to 30 outlines in 2D. The 3D sequence uses up to seven solids."],
      grow: ["Trace (seconds)", [0.25,8,0.05], "Time for the dot to draw one outline or solid at full size."],
      hold: ["Contact hold (seconds)", [0,5,0.05], "Time each intermediate outline spends at the boundary."],
      shrink: ["Shrink (seconds)", [0.25,8,0.05], "Time for the finished level and all levels inside it to shrink together."],
      repeat: ["Loop", null, "Start a new build after the final display."],
      finaleHold: ["Final display (seconds)", [1,30,0.5], "Time before the next build when looping is enabled."]
    },
    view: {
      size: ["Scene size", [0.35,0.95,0.01], "Boundary diameter relative to the viewport."],
      orbit: ["Auto-orbit", null, "Slowly rotate the 3D scene while it plays."],
      orbitSpeed: ["Orbit (degrees/second)", [0,60,1], "Rotation speed in 3D."],
      perspective: ["Perspective", null, "Turn off to switch to orthographic projection."],
      showBoundary: ["Show boundary", null, "Show the 2D circle or 3D sphere and its contact effects."]
    },
    style: {
      background: ["Background", "color", "Use #00000000 for a transparent background."],
      boundary: ["Boundary color", "color", "Color of the circle or sphere."],
      lineWidth: ["Line width", [0.5,4,0.1], "Outline width in CSS pixels."],
      edgeOpacity: ["Edge opacity", [0,1,0.01], "Opacity of the 2D outlines and 3D edges."],
      glow: ["Glow", [0,30,1], "Soft light around the edges."],
      palette: ["Level colors", "palette", "Colors are applied from the center outward."]
    },
    features: {
      lines: {
        tracers: {
          enabled: ["Edge tracers", null, "Keep dots moving on finished outlines."],
          speed: ["Tracer speed", [0.025,1,0.005], "Outline laps per second in 2D."],
          size: ["Tracer diameter (px)", [2,20,0.5], "Diameter of the live and settled tracers in screen pixels."]
        },
        hotEdge: effect("Hot edge", "Warm light follows the active drawing point."),
        depth: {
          enabled: ["Depth-aware wireframes", null, "Shade each point along an edge by its camera-space depth."],
          opacity: ["Rear edge opacity", [0.05,1,0.01], "Minimum opacity at the far side of the sphere."]
        }
      },
      boundary: {
        contact: {
          enabled: ["Contact flash", null, "Light up the boundary when a trace finishes."],
          intensity: ["Flash intensity", [0,1,0.05], "Brightness of the contact effect."]
        },
        waves: effect("Boundary waves", "Send light around the circle or across the visible sphere."),
        sparks: effect("Sparks", "Emit glowing particles as the tracing point turns at corners."),
        atmosphere: effect("Reactive atmosphere", "Light a thin volume inside the sphere.")
      },
      materials: {
        glass: {
          enabled: ["Glass faces", null, "Fill fully traced 3D faces with color."],
          opacity: ["Face opacity", [0,0.35,0.005], "Transparency of each closed face."]
        },
        crystallize: {
          ...effect("Face crystallization", "Sweep light inward across newly closed faces."),
          duration: ["Sweep duration", [0.05,2,0.05], "Time for the highlight to reach the center of the face."]
        },
        iridescence: effect("Iridescent glass", "Shift the tint with the viewing angle."),
        seams: effect("Luminous seams", "Highlight the borders of completed faces."),
        refraction: effect("Refraction", "Distort the visible scene through a face."),
        mirror: {
          ...effect("Mirror reflections", "Reflect the visible scene or use a local image as an environment."),
          source: ["Reflection source", ["Scene","Image"], "Live scene or uploaded image."],
          spread: ["Scene distortion", [0,2,0.05], "Screen-space spread of the live reflection."],
          image: ["Reflection image", "image", "Choose a local image. Image bytes stay out of exported settings."]
        }
      },
      transitions: {
        echoes: effect("Contraction echoes", "Leave brief fading copies behind the shrinking outline."),
        pulse: effect("Light between levels", "Send a pulse inward through the nested outlines."),
        fade: {
          enabled: ["Fade older outlines", null, "Dim settled shapes after the chosen number of newer levels."],
          after: ["Fade after levels", [1,29,1], "Number of newer levels before a shape begins to dim."],
          opacity: ["Older outline opacity", [0,1,0.01], "Resting opacity after the fade."]
        },
        closeup: {
          enabled: ["Final close-up", null, "Zoom into the center after the final level finishes."],
          magnification: ["Magnification", [1,8,0.25], "Requested final zoom multiplier, capped at 2× overall."]
        }
      }
    }
  };
  const presets = {
    "Reference colors": {},
    "Ice blue": { style: {
      background: "#081220", boundary: "#d7f6ff",
      palette: ["#ffffff","#c8f6ff","#94eaff","#65c7ff","#65a4ff","#a3a3ff","#c5bdff"]
    } },
    "Warm glass": { simulation: { mode: "3D" }, style: {
      background: "#180d1a", glow: 18,
      palette: ["#fff3bb","#ffc375","#ff906a","#ff6e85","#ff86c7","#dca1fd","#ffffff"]
    } },
    "Transparent overlay": { style: { background: "#00000000", glow: 6 } }
  };

  function element(tag, text) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    return node;
  }

  const css = element("style");
  css.textContent = `
    #snow-settings { position: fixed; top: 12px; right: 12px; width: min(345px, calc(100vw - 24px));
      max-height: calc(100dvh - 100px); overflow: auto; background: #111628f5; border: 1px solid #56628a;
      padding: 14px; border-radius: 10px; box-shadow: 0 8px 30px #0007 }
    #snow-settings h2 { margin: 0 0 10px; font-size: 17px }
    #snow-settings details { border-top: 1px solid #414963; padding: 8px 0 }
    #snow-settings details details { margin-left: 9px }
    #snow-settings summary { cursor: pointer; padding: 3px 0; font-weight: 600 }
    #snow-settings input, #snow-settings select, #snow-settings textarea { color: inherit; accent-color: #a0acff }
    #snow-settings input[type="search"], #snow-settings select, #snow-settings textarea { width: 100%; margin-bottom: 8px }
    #snow-settings input[type="file"] { width: 100%; min-width: 0 }
    #snow-settings textarea { min-height: 80px; resize: vertical }
    #snow-settings label.snow-field { display: grid; grid-template-columns: 1fr minmax(65px, 44%); gap: 8px;
      align-items: center; margin: 7px 0 }
    #snow-settings label.snow-field select { margin-bottom: 0 }
    #snow-settings .snow-actions, #snow-settings .snow-palette { display: flex; flex-wrap: wrap; gap: 6px }
    #snow-settings .snow-palette input { width: 32px; height: 26px; padding: 0; background: transparent; border: 0 }
    #snow-settings .snow-range { display: grid; grid-template-columns: minmax(0,1fr) 4ch;
      align-items: center; gap: 4px }
    #snow-settings .snow-range input { width: 100%; min-width: 0; margin: 0 }
    #snow-settings .snow-range-value { text-align: right; font-variant-numeric: tabular-nums }
    #snow-settings output { display: block; margin-top: 6px; color: #c8d1ff }
  `;
  document.head.append(css);
  const panel = element("aside");
  panel.id = "snow-settings";
  panel.hidden = true;
  panel.setAttribute("aria-label", "Snowflake settings");
  button.setAttribute("aria-controls", panel.id);
  button.hidden = false;
  panel.append(element("h2", "Settings"));

  const search = element("input");
  search.type = "search";
  search.placeholder = "Find a setting";
  search.setAttribute("aria-label", "Find a setting");
  const preset = element("select");
  preset.setAttribute("aria-label", "Preset");
  preset.append(new Option("Choose a preset", ""));
  for (const name of Object.keys(presets)) preset.append(new Option(name, name));
  const groups = element("div");
  panel.append(search, preset, groups);

  const actions = element("div");
  actions.className = "snow-actions";
  const json = element("textarea");
  json.setAttribute("aria-label", "Settings JSON");
  json.hidden = true;
  const status = element("output");
  status.setAttribute("aria-live", "polite");
  panel.append(actions, json, status);
  document.body.append(panel);

  const colorPattern = /^#(?:[0-9a-f]{6}|[0-9a-f]{8})$/i;
  function valid(value, definition, fallback) {
    const [, type] = definition;
    if (type === "image") return typeof value === "boolean";
    if (type === "color") return typeof value === "string" && colorPattern.test(value);
    if (type === "palette") return Array.isArray(value) && value.length === fallback.length
      && value.every(v => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v));
    if (!type) return typeof value === "boolean";
    if (typeof type[0] === "string") return type.includes(value);
    const [min,max,step] = type;
    return typeof value === "number" && value >= min && value <= max
      && Math.abs((value - min) / step - Math.round((value - min) / step)) < 1e-6;
  }

  function merge(source, target, fields) {
    for (const [key, definition] of Object.entries(fields)) {
      const value = source?.[key];
      if (value === undefined) continue;
      if (Array.isArray(definition)) {
        if (!valid(value, definition, target[key])) throw new Error("Invalid value for " + definition[0]);
        target[key] = structuredClone(value);
      } else {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
          throw new Error("Invalid settings section: " + key);
        }
        merge(value, target[key], definition);
      }
    }
  }

  const title = key => key[0].toUpperCase() + key.slice(1);
  function field(parent, key, definition, model, path) {
    const [name, type, help] = definition;
    const row = element(type === "palette" ? "div" : "label", name);
    row.className = "snow-field";
    row.title = help;
    row.dataset.setting = path;
    row.dataset.search = (path + " " + name + " " + help).toLowerCase();
    let input;
    function update(value) {
      status.textContent = "";
      if (!valid(value, definition, model[key])) {
        status.textContent = "Invalid value for " + name;
        return;
      }
      model[key] = value;
      onChange(path);
      if (key === "enabled" || key === "source") filter();
    }
    if (type === "image") {
      const tools = element("div");
      const picker = element("input");
      picker.type = "file";
      picker.accept = "image/*";
      picker.setAttribute("aria-label",name);
      const clear = element("button","Clear image");
      clear.type = "button";
      const info = element("small",imageName || "No image selected");
      async function choose(file) {
        try {
          await onImage(file);
          imageName = file?.name || "";
          info.textContent = imageName || "No image selected";
          status.textContent = imageName ? "Reflection image loaded." : "Reflection image cleared.";
        } catch (error) { status.textContent = error.message; }
        picker.value = "";
      }
      picker.onchange = () => { if (picker.files[0]) void choose(picker.files[0]); };
      clear.onclick = () => void choose(null);
      tools.append(picker,clear,info);
      row.append(tools);
    } else if (type === "palette") {
      const palette = element("div");
      palette.className = "snow-palette";
      model[key].forEach((color, index) => {
        const picker = element("input");
        picker.type = "color";
        picker.value = color;
        picker.setAttribute("aria-label", "Level " + (index + 1) + " color");
        picker.oninput = () => update(model[key].map((v,i) => i === index ? picker.value : v));
        palette.append(picker);
      });
      row.append(palette);
    } else if (Array.isArray(type) && typeof type[0] === "string") {
      input = element("select");
      for (const option of type) input.append(new Option(option, option));
      input.value = model[key];
      input.onchange = () => update(input.value);
      row.append(input);
    } else {
      input = element("input");
      if (type === "color") {
        input.type = "text";
        input.value = model[key];
        input.onchange = () => update(input.value.trim());
      } else if (type) {
        input.type = "range";
        input.setAttribute("aria-label",name);
        [input.min, input.max, input.step] = type;
        input.value = model[key];
        const value = element("span",input.value);
        value.className = "snow-range-value";
        value.setAttribute("aria-hidden","true");
        const controls = element("span");
        controls.className = "snow-range";
        controls.append(input,value);
        input.oninput = () => {
          update(input.valueAsNumber);
          value.textContent = input.value;
        };
        row.append(controls);
        parent.append(row);
        return;
      } else {
        input.type = "checkbox";
        input.checked = model[key];
        input.onchange = () => update(input.checked);
      }
      row.append(input);
    }
    parent.append(row);
  }

  function section(parent, fields, data, path = "") {
    for (const [key, definition] of Object.entries(fields)) {
      const full = path ? path + "." + key : key;
      if (Array.isArray(definition)) {
        field(parent, key, definition, data, full);
        continue;
      }
      const group = element("details");
      group.dataset.path = full;
      group.open = full === "simulation" || full === "features";
      group.append(element("summary", title(key)));
      section(group, definition, data[key], full);
      parent.append(group);
    }
  }
  let openBeforeSearch;
  function filter() {
    const query = search.value.trim().toLowerCase();
    const details = [...groups.querySelectorAll("details")];
    if (query && !openBeforeSearch) {
      openBeforeSearch = new Set(details.filter(group => group.open).map(group => group.dataset.path));
    }
    for (const row of groups.querySelectorAll(".snow-field")) {
      const parts = row.dataset.setting.split(".");
      const feature = parts[0] === "features" ? config.features[parts[1]]?.[parts[2]] : null;
      const key = parts.at(-1);
      const mirror = feature === config.features.materials.mirror;
      row.hidden = (feature && key !== "enabled" && key !== "size" && !feature.enabled)
        || (mirror && (key === "image" && feature.source !== "Image" || key === "spread" && feature.source !== "Scene"))
        || !row.dataset.search.includes(query);
    }
    for (const group of details.reverse()) {
      group.hidden = !!query && !group.querySelector(".snow-field:not([hidden])");
      if (query && !group.hidden) group.open = true;
      else if (openBeforeSearch) group.open = openBeforeSearch.has(group.dataset.path);
    }
    if (!query) openBeforeSearch = undefined;
  }

  function rebuild() {
    groups.replaceChildren();
    section(groups, schema, config);
    filter();
  }
  function apply(value, resetToDefault) {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected a JSON object.");
    const next = structuredClone(resetToDefault ? original : config);
    // Accept settings exported before Features was grouped.
    const input = structuredClone(value);
    for (const [name, group] of Object.entries({ tracers:"lines", contact:"boundary", glass:"materials", fade:"transitions" })) {
      if (!input.features || typeof input.features !== "object" || !(name in input.features)) continue;
      input.features[group] ??= {};
      input.features[group][name] ??= input.features[name];
    }
    merge(input, next, schema);
    Object.assign(config, next);
    onChange();
    rebuild();
  }
  function action(label, callback) {
    const control = element("button", label);
    control.type = "button";
    control.onclick = () => {
      try { status.textContent = callback() || ""; }
      catch (error) { status.textContent = error.message; }
    };
    actions.append(control);
  }

  action("Show / export JSON", () => {
    json.value = JSON.stringify(config, null, 2);
    json.hidden = false;
    json.focus();
    json.select();
    return "Copy these settings or edit and import them.";
  });
  action("Import JSON", () => {
    if (json.hidden) {
      json.hidden = false;
      json.focus();
      return "Paste your settings, then select Import JSON again.";
    }
    apply(JSON.parse(json.value), false);
    return "Settings imported.";
  });
  action("Reset", () => {
    apply({}, true);
    preset.value = "";
    return "Default settings restored.";
  });
  button.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    button.setAttribute("aria-expanded", String(!panel.hidden));
    if (!panel.hidden) search.focus();
  });
  panel.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      button.click();
      button.focus();
    }
  });
  search.addEventListener("input", filter);
  preset.addEventListener("change", () => {
    if (preset.value) {
      apply(presets[preset.value], true);
      status.textContent = "";
    }
  });
  document.addEventListener("snowflake-mode", rebuild);
  rebuild();
};