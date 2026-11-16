'use strict';

window.mountSolarSettings = function ({ config, defaults, presets, sections, onChange, now }) {
  const add = (parent, tag, text = '') => {
    const node = document.createElement(tag);
    node.textContent = text;
    parent.append(node);
    return node;
  };
  const root = add(document.body, 'aside');
  root.id = 'solar-settings';
  const toggle = add(root, 'button', 'Solar settings');
  const panel = add(root, 'div');
  panel.className = 'settings-panel';
  panel.id = 'solar-settings-panel';
  panel.hidden = true;
  toggle.setAttribute('aria-controls', panel.id);
  function show(open) {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) search.focus();
    else toggle.focus();
  }
  toggle.setAttribute('aria-expanded', 'false');
  toggle.onclick = () => show(panel.hidden);
  root.onkeydown = event => { if (event.key === 'Escape' && !panel.hidden) show(false); };

  add(panel, 'h2', 'Solar System');
  const search = add(panel, 'input');
  search.type = 'search';
  search.placeholder = 'Find a setting…';
  search.setAttribute('aria-label', 'Find a setting');
  const presetLabel = add(panel, 'label', 'Preset ');
  const preset = add(presetLabel, 'select');
  add(preset, 'option', 'Custom').disabled = true;
  for (const name of Object.keys(presets)) add(preset, 'option', name);
  const rows = [];
  const groups = [];
  for (const [title, fields] of Object.entries(sections)) {
    const group = add(panel, 'details');
    group.open = title === 'View';
    add(group, 'summary', title);
    groups.push(group);
    for (const field of fields) {
      const { key, label, min, max, step, options } = field;
      const row = add(group, 'label');
      add(row, 'span', label);
      const input = add(row, options ? 'select' : 'input');
      const output = min === undefined ? null : add(row.firstChild, 'output');
      if (options) {
        for (const [value, name] of Object.entries(options)) add(input, 'option', name).value = value;
      } else {
        input.type = min !== undefined ? 'range' : typeof defaults[key] === 'boolean' ? 'checkbox' : 'text';
        if (min !== undefined) Object.assign(input, { min, max, step });
      }
      function refresh() {
        if (input.type === 'checkbox') input.checked = config[key];
        else input.value = config[key];
        if (output) output.value = config[key];
      }
      input.addEventListener(input.type === 'range' ? 'input' : 'change', () => {
        const value = input.type === 'checkbox' ? input.checked : min !== undefined ? input.valueAsNumber : input.value.trim();
        if (field.validate && !field.validate(value)) {
          status.textContent = 'Enter a CSS background color, including transparent or #RRGGBBAA.';
          refresh();
          return;
        }
        config[key] = value;
        status.textContent = '';
        onChange();
        sync();
      });
      rows.push({ field, row, group, refresh });
    }
  }
  const actions = add(panel, 'div');
  actions.className = 'settings-actions';
  const status = add(panel, 'div');
  status.setAttribute('role', 'status');
  const upload = add(panel, 'input');
  upload.hidden = true;
  upload.type = 'file';
  upload.accept = '.json,application/json';
  let savedSections;
  function sync() {
    for (const { row, field, refresh } of rows) {
      refresh();
      const query = search.value.trim().toLowerCase();
      row.hidden = Boolean((field.when && !field.when(config)) || (query && !field.label.toLowerCase().includes(query)));
    }
    for (const group of groups) group.hidden = !rows.some(row => row.group === group && !row.row.hidden);
    preset.value = Object.keys(presets).find(name =>
      Object.keys(defaults).every(key => config[key] === (presets[name][key] ?? defaults[key]))) || 'Custom';
  }
  search.oninput = () => {
    if (search.value.trim()) {
      savedSections ??= groups.map(group => group.open);
      groups.forEach(group => { group.open = true; });
    } else if (savedSections) {
      groups.forEach((group, index) => { group.open = savedSections[index]; });
      savedSections = undefined;
    }
    sync();
  };
  function apply(values) {
    Object.assign(config, defaults, values);
    status.textContent = '';
    onChange();
    sync();
  }
  preset.onchange = () => apply(presets[preset.value]);
  add(actions, 'button', 'Now').onclick = now;
  add(actions, 'button', 'Reset').onclick = () => apply({});
  add(actions, 'button', 'Import JSON').onclick = () => upload.click();
  add(actions, 'button', 'Export JSON').onclick = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    Object.assign(link, { href: url, download: 'solar-system-settings.json' });
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  upload.onchange = async () => {
    const file = upload.files[0];
    if (!file) return;
    try {
      const values = JSON.parse(await file.text());
      if (!values || typeof values !== 'object' || Array.isArray(values)) throw new Error();
      const accepted = {};
      for (const { field } of rows) {
        const { key, min, max, options, validate } = field;
        if (!Object.hasOwn(values, key)) continue;
        const value = values[key];
        if (typeof value !== typeof defaults[key] || (options && !Object.hasOwn(options, value)) ||
            (min !== undefined && (!Number.isFinite(value) || value < min || value > max)) ||
            (validate && !validate(value))) throw new Error();
        accepted[key] = value;
      }
      apply(accepted);
      status.textContent = 'Settings imported.';
    } catch {
      status.textContent = 'Could not import this settings file.';
    } finally {
      upload.value = '';
    }
  };
  sync();
  return { sync };
};