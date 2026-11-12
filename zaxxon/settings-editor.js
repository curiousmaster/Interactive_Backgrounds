'use strict';

function settingsEditor(root, config, schema, resize, restart) {
  const defaults = structuredClone(config);
  const search = document.createElement('input');
  search.type = 'search';
  search.placeholder = 'Search settings';
  search.setAttribute('aria-label', 'Search settings');
  const sections = document.createElement('div');
  const json = document.createElement('textarea');
  json.rows = 9;
  json.hidden = true;
  json.setAttribute('aria-label', 'Settings JSON');
  const status = document.createElement('div');
  status.setAttribute('role', 'status');

  function button(title, action) {
    const element = document.createElement('button');
    element.textContent = title;
    element.onclick = action;
    return element;
  }

  function normalize(value, rule, fallback) {
    if (typeof rule === 'boolean') return typeof value === 'boolean' ? value : fallback;
    if (typeof rule[0] === 'string') return rule.includes(value) ? value : fallback;
    if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
    const [min, max, step] = rule;
    const rounded = Number((min + Math.round((value - min) / step) * step).toFixed(6));
    return Math.min(max, Math.max(min, rounded));
  }

  function apply(data) {
    const imported = { ...data, game: data.game ?? data.level, visual: data.visual ?? data.view };
    for (const [group, rules] of Object.entries(schema)) {
      for (const [name, rule] of Object.entries(rules)) {
        config[group][name] = normalize(imported[group]?.[name], rule, config[group][name]);
      }
    }
    draw();
    resize();
    restart();
  }

  const presets = document.createElement('select');
  presets.setAttribute('aria-label', 'Preset');
  for (const name of ['Presets', 'Classic Arcade', 'Cinematic 3D']) {
    presets.add(new Option(name));
  }
  presets.onchange = () => {
    if (!presets.selectedIndex) return;
    const cinematic = presets.selectedIndex === 2;
    const preset = structuredClone(defaults);
    preset.visual.camera = cinematic ? '3D' : 'Classic';
    preset.features.intensity = cinematic ? 1.15 : 0.45;
    Object.assign(config.visual, preset.visual);
    Object.assign(config.features, preset.features);
    draw();
    resize();
    presets.selectedIndex = 0;
  };

  root.append(search, presets, sections,
    button('Show JSON', () => {
      json.hidden = !json.hidden;
      if (!json.hidden) json.value = JSON.stringify(config, null, 2);
    }),
    button('Import', () => {
      json.hidden = false;
      try {
        const data = JSON.parse(json.value);
        if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error();
        apply(data);
        status.textContent = 'Settings imported.';
      } catch {
        status.textContent = 'Paste a valid settings JSON object.';
      }
    }),
    button('Export', () => {
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'zaxxon-settings.json';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }), json, status);

  const names = { idleAutopilot: 'Idle autopilot', spaceSeconds: 'Space interval (seconds)',
    damageFx: 'Damage effects', reducedFlash: 'Reduced flashes', clearance: 'Clearance HUD',
    random: 'Random levels', seed: 'Seed (0 = fresh)', scale: 'Render scale',
    ghost: 'Best run ghost', lighting: 'Reactive lighting', nebula: 'Animated nebula',
    trails: 'Engine trails', debris: 'Explosion debris', intensity: 'Bloom intensity',
    radius: 'Bloom radius', threshold: 'Bloom threshold' };
  const folded = new Map();

  function draw() {
    const query = search.value.trim().toLowerCase();
    sections.replaceChildren();
    for (const [heading, groups] of [['Game Features', ['game']], ['Visual Features', ['visual', 'features']]]) {
      const section = document.createElement('details');
      section.open = !!query || (folded.get(heading) ?? true);
      section.ontoggle = () => {
        if (!query && section.isConnected) folded.set(heading, section.open);
      };
      const title = document.createElement('summary');
      title.textContent = heading;
      section.append(title);
      for (const group of groups) for (const [name, rule] of Object.entries(schema[group])) {
        if (group === 'features' && !config.features.bloom
          && ['intensity', 'radius', 'threshold'].includes(name)) continue;
        if (name === 'seed' && !config.game.random) continue;
        const caption = names[name] ?? name[0].toUpperCase() + name.slice(1);
        if (!`${heading} ${caption}`.toLowerCase().includes(query)) continue;
        const row = document.createElement('label');
        row.textContent = caption;
        const select = Array.isArray(rule) && typeof rule[0] === 'string';
        const input = document.createElement(select ? 'select' : 'input');
        if (select) rule.forEach(choice => input.add(new Option(choice)));
        else if (typeof rule === 'boolean') input.type = 'checkbox';
        else {
          input.type = 'number';
          [input.min, input.max, input.step] = rule;
        }
        if (input.type === 'checkbox') input.checked = config[group][name];
        else input.value = config[group][name];
        input.onchange = () => {
          const value = select ? input.value : input.type === 'checkbox'
            ? input.checked : input.valueAsNumber;
          config[group][name] = normalize(value, rule, config[group][name]);
          if (input.type !== 'checkbox') input.value = config[group][name];
          if (name === 'scale') resize();
          if (name === 'random' || name === 'seed') restart();
          if (name === 'random' || name === 'bloom') draw();
        };
        row.append(input);
        section.append(row);
      }
      if (section.children.length > 1) sections.append(section);
    }
  }

  search.oninput = draw;
  draw();
  return draw;
}