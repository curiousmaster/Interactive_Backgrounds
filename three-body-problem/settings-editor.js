/* Schema-driven settings editor for animated backgrounds. */
(() => {
  "use strict";

  const element = (tag, text) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const read = (object, path) => path.split(".").reduce((value, key) => value?.[key], object);
  const write = (object, path, value) => {
    const keys = path.split(".");
    const key = keys.pop();
    for (const part of keys) object = object[part] ??= {};
    object[key] = value;
  };
  const isColor = value => typeof value === "string" && /^#(?:[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value);
  const clone = object => JSON.parse(JSON.stringify(object));

  function normalize(field, value, fallback) {
    switch (field.type) {
      case "boolean": return typeof value === "boolean" ? value : fallback;
      case "select": return typeof value === "string" && Object.hasOwn(field.options, value) ? value : fallback;
      case "color": return isColor(value) ? value.toUpperCase() : fallback;
      case "range": {
        if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
        const bounded = Math.min(field.max, Math.max(field.min, value));
        if (field.continuous) return bounded;
        return Number((field.min + Math.round((bounded - field.min) / field.step) * field.step).toFixed(6));
      }
      default: return fallback;
    }
  }

  window.createSettingsEditor = ({ root, defaults, presets, sections, sectionHelp = {}, storageKey, onChange, onRestart, onPause, title: name = "Background", initiallyPaused = false }) => {
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
    } catch {
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
    open.setAttribute("aria-controls", "cascade-settings");

    const panel = element("aside");
    panel.className = "settings-panel";
    panel.id = "cascade-settings";
    panel.setAttribute("aria-label", name + " settings");
    const header = element("header");
    const title = element("div");
    title.append(element("h1", name));
    const close = button("×", () => setOpen(false, true));
    close.setAttribute("aria-label", "Close settings");
    header.append(title, close);

    const search = element("input");
    search.type = "search";
    search.placeholder = "Search settings…";
    search.setAttribute("aria-label", "Search settings");

    const preset = element("select");
    preset.setAttribute("aria-label", "Preset");
    preset.append(new Option("Custom", ""), ...Object.keys(presets).map(name => new Option(name, name)));
    preset.value = Object.hasOwn(presets, remembered) ? remembered : "";
    preset.addEventListener("change", () => {
      if (preset.value) apply(sanitize(presets[preset.value]), preset.value);
      else save();
    });
    const presetRow = element("div");
    presetRow.className = "settings-preset";
    presetRow.append(element("span", "Preset"), preset);

    let paused = initiallyPaused;
    const pause = button(paused ? "Resume" : "Pause", () => {
      paused = !paused;
      pause.textContent = paused ? "Resume" : "Pause";
      pause.setAttribute("aria-pressed", String(paused));
      onPause(paused);
    });
    pause.setAttribute("aria-pressed", String(paused));
    const actions = element("div");
    actions.className = "settings-actions";
    actions.append(pause, button("Restart", onRestart), button("Reset settings", () => {
      apply(clone(defaults), Object.keys(presets)[0]);
      onRestart();
      announce("Default settings restored.");
    }));

    const controls = element("div");
    controls.className = "settings-controls";
    const empty = element("p", "No enabled settings match your search.");
    const tooltip = element("div");
    tooltip.className = "settings-section-help";
    tooltip.hidden = true;
    tooltip.setAttribute("aria-hidden", "true");
    const descriptions = element("div");
    descriptions.hidden = true;
    let helpAnchor;

    function hideHelp() {
      tooltip.hidden = true;
      helpAnchor = null;
    }

    function sectionHeader(label) {
      const summary = element("summary", label);
      const help = Object.hasOwn(sectionHelp, label) ? sectionHelp[label] : null;
      if (!help) return summary;

      const description = element("span", help);
      description.id = `cascade-section-help-${descriptions.childElementCount + 1}`;
      descriptions.append(description);
      summary.setAttribute("aria-describedby", description.id);

      function showHelp() {
        helpAnchor = summary;
        tooltip.textContent = help;
        tooltip.hidden = false;
        const headerBounds = summary.getBoundingClientRect();
        const panelBounds = panel.getBoundingClientRect();
        const { offsetWidth: width, offsetHeight: height } = tooltip;
        const side = panelBounds.left - width - 8;
        const inline = side < 8;
        const left = inline ? headerBounds.left : side;
        const top = inline ? headerBounds.bottom + 6 : headerBounds.top;
        tooltip.style.left = Math.max(8, Math.min(left, window.innerWidth - width - 8)) + "px";
        tooltip.style.top = Math.max(8, Math.min(top, window.innerHeight - height - 8)) + "px";
      }
      const dismiss = () => { if (helpAnchor === summary) hideHelp(); };
      summary.addEventListener("pointerenter", event => {
        if (event.pointerType !== "touch") showHelp();
      });
      summary.addEventListener("pointerleave", dismiss);
      summary.addEventListener("focus", () => {
        if (summary.matches(":focus-visible")) showHelp();
      });
      summary.addEventListener("blur", dismiss);
      return summary;
    }

    const parents = new Map();
    const categories = new Map();
    const views = sections.map(section => {
      const details = element("details");
      details.open = Boolean(section.open);
      const summary = sectionHeader(section.label);
      details.append(summary);
      const groups = section.groups.map(group => {
        const container = element("div");
        container.className = "settings-group";
        if (group.label) container.append(element("h2", group.label));
        const rows = group.fields.map(field => {
          const row = element("div");
          row.className = "settings-row";
          const label = element("label", field.label);
          const id = "cascade-" + field.path.replaceAll(".", "-");
          label.htmlFor = id;
          const description = field.help ? element("small", field.help) : null;
          if (description) description.id = id + "-help";
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
          } else if (field.type === "color") {
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
              if (isColor(value)) update(value);
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
          } else if (field.type === "select") {
            input = element("select");
            for (const [value, label] of Object.entries(field.options)) input.append(new Option(label, value));
            input.addEventListener("change", () => update(input.value));
            sync = () => { input.value = read(config, field.path); };
            line.append(input);
            row.append(line);
          } else {
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
        details.append(container);
        return { group, container, rows };
      });
      let parent;
      let category;
      let switchRow;
      if (section.parent) {
        parent = parents.get(section.parent);
        if (!parent) {
          parent = element("details");
          parent.append(sectionHeader(section.parent));
          parents.set(section.parent, parent);
          controls.append(parent);
        }
        details.classList.add("settings-subsection");
        if (section.category) {
          const key = JSON.stringify([section.parent, section.category]);
          category = categories.get(key);
          if (!category) {
            category = element("details");
            category.className = "settings-feature-group";
            category.append(sectionHeader(section.category));
            categories.set(key, category);
            parent.append(category);
          }
        }
        (category || parent).append(details);
      } else {
        controls.append(details);
      }
      if (section.enabledPath) {
        switchRow = groups.flatMap(group => group.rows).find(row => row.field.path === section.enabledPath);
        const input = switchRow.row.querySelector("input");
        input.setAttribute("aria-label", "Enable " + section.label);
        summary.append(input);
        input.addEventListener("click", event => event.stopPropagation());
        summary.addEventListener("click", event => {
          if (event.target === input) event.stopPropagation();
          else if (!read(config, section.enabledPath)) event.preventDefault();
        });
      }
      return { section, details, groups, parent, category, switchRow, enabled: false };
    });

    const status = element("p");
    status.className = "settings-status";
    status.setAttribute("role", "status");
    const stats = element("output");
    stats.className = "settings-stats";
    stats.hidden = true;
    const io = element("details");
    io.append(sectionHeader("Import or export settings"));
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
          || !fields.some(field => read(parsed, field.path) !== undefined)) throw new Error();
        apply(sanitize(parsed, config), "");
        announce("Settings imported.");
      } catch {
        announce(`Paste a JSON object containing ${name} settings.`);
      }
    }));
    io.append(json, ioActions);
    panel.append(header, search, presetRow, actions, stats, controls, empty, io, status);
    root.append(open, panel, tooltip, descriptions);
    panel.addEventListener("scroll", hideHelp);
    window.addEventListener("resize", hideHelp);

    const containers = [...parents.values(), ...categories.values()];
    let priorOpen = null;
    let priorParents = null;
    function filter() {
      const terms = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      if (terms.length && !priorOpen) {
        priorOpen = views.map(view => view.details.open);
        priorParents = new Map(containers.map(parent => [parent, parent.open]));
      }
      const visibleParents = new Set();
      let any = false;
      for (const [index, view] of views.entries()) {
        const enabled = !view.section.enabledPath || Boolean(read(config, view.section.enabledPath));
        const toggleMatches = terms.every(term =>
          [view.section.parent, view.section.category, view.section.label, view.section.enabledPath].join(" ").toLowerCase().includes(term));
        let sectionVisible = Boolean(view.switchRow && toggleMatches);
        for (const { group, container, rows } of view.groups) {
          let groupVisible = false;
          for (const { field, row } of rows) {
            if (view.switchRow?.field === field) { row.hidden = true; continue; }
            const haystack = [view.section.parent, view.section.category, view.section.label, group.label, field.label, field.path, field.help].join(" ").toLowerCase();
            const visible = enabled && (!field.when || field.when(config)) && terms.every(term => haystack.includes(term));
            row.hidden = !visible;
            groupVisible ||= visible;
          }
          container.hidden = !groupVisible;
          sectionVisible ||= groupVisible;
        }
        view.details.hidden = !sectionVisible;
        if (!enabled) view.details.open = false;
        else if (terms.length) view.details.open = sectionVisible;
        else if (priorOpen) view.details.open = priorOpen[index];
        else if (view.switchRow && !view.enabled) view.details.open = true;
        view.enabled = enabled;
        if (sectionVisible && view.parent) visibleParents.add(view.parent);
        if (sectionVisible && view.category) visibleParents.add(view.category);
        any ||= sectionVisible;
      }
      for (const parent of containers) {
        parent.hidden = !visibleParents.has(parent);
        if (terms.length) parent.open = !parent.hidden;
        else if (priorParents) parent.open = priorParents.get(parent);
      }
      if (!terms.length) priorOpen = priorParents = null;
      empty.hidden = any;
      io.hidden = terms.length > 0;
    }

    function setOpen(visible, focus = false) {
      hideHelp();
      panel.hidden = !visible;
      open.hidden = visible;
      open.setAttribute("aria-expanded", String(visible));
      if (focus) open.focus();
    }
    function announce(message) { status.textContent = message; }
    function save() {
      try { localStorage.setItem(storageKey, JSON.stringify({ config, preset: preset.value })); }
      catch { /* Optional browser storage. */ }
    }
    function apply(next, name) {
      config = next;
      preset.value = name;
      syncAll();
      onChange(config, null);
      save();
    }
    function syncAll() {
      for (const view of views) for (const group of view.groups) for (const row of group.rows) row.sync();
      filter();
    }

    search.addEventListener("input", filter);
    document.addEventListener("keydown", event => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "Escape" && !panel.hidden) {
        if (helpAnchor) hideHelp();
        else setOpen(false, true);
      }
      if (event.key.toLowerCase() === "g" && !event.repeat
        && !event.target.closest?.("input, textarea, select, [contenteditable]")) {
        setOpen(panel.hidden);
      }
    });
    setOpen(!new URLSearchParams(location.search).has("embed") && window.innerWidth > 820 && !window.matchMedia("(pointer: coarse)").matches);
    syncAll();
    return {
      get config() { return config; },
      commitChanges() {
        preset.value = "";
        syncAll();
        save();
      },
      setStats(message) {
        stats.hidden = !message;
        if (message && stats.textContent !== message) stats.textContent = message;
      }
    };
  };
})();