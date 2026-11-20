/* Quantum Ant Colony — dependency-free, schema-driven settings editor.
   This file is a sibling of index.html (not setting-editor.js). */

const read = (obj, path) => path.split('.').reduce((v, part) => v?.[part], obj);
const write = (obj, path, value) => {
  const parts = path.split('.');
  const last = parts.pop();
  let target = obj;
  for (const part of parts) target = target[part] ??= {};
  target[last] = value;
};
const element = (tag, className = '', text = '') => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
};

export function mountSettingsEditor({ host, config, schema, presets, onChange, onAction }) {
  const state = { query: '', collapsed: new Set(), activePreset: 'Custom' };
  const root = element('div', 'editor-content');
  host.replaceChildren(root);
  let rows = [];
  let sections = [];

  function exportConfig() {
    return JSON.stringify({ version: 1, background: 'Quantum Ant Colony', settings: config }, null, 2);
  }

  function fileDownload(filename, text) {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function showJsonDialog(importMode) {
    const mask = element('div', 'json-mask');
    const dialog = element('div', 'json-dialog');
    const heading = element('h3', '', importMode ? 'Import settings' : 'Export settings');
    const note = element('p', 'muted', importMode
      ? 'Paste JSON exported from this background. Only known settings are applied.'
      : 'Copy these settings or save them as a JSON file.');
    const area = element('textarea', 'json-area');
    area.spellcheck = false;
    area.value = importMode ? '' : exportConfig();
    const warning = element('div', 'error-line');
    const buttons = element('div', 'dialog-buttons');
    const close = element('button', 'small-button', 'Close');
    const primary = element('button', 'small-button primary', importMode ? 'Apply JSON' : 'Copy JSON');
    const download = element('button', 'small-button', importMode ? 'Open file' : 'Download JSON');
    close.onclick = () => mask.remove();
    primary.onclick = async () => {
      if (importMode) {
        try {
          const parsed = JSON.parse(area.value);
          const incoming = parsed.settings ?? parsed;
          if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
            throw new Error('Expected a settings object.');
          }
          onAction('import', incoming);
          state.activePreset = 'Custom';
          mask.remove();
          render();
        } catch (error) { warning.textContent = error.message; }
      } else {
        try {
          await navigator.clipboard.writeText(area.value);
          primary.textContent = 'Copied';
        } catch (_) {
          area.focus(); area.select();
          warning.textContent = 'Clipboard unavailable; select and copy the JSON manually.';
        }
      }
    };
    const picker = element('input');
    picker.type = 'file';
    picker.accept = '.json,application/json';
    picker.hidden = true;
    picker.onchange = async () => {
      const file = picker.files?.[0];
      if (file) area.value = await file.text();
    };
    download.onclick = () => importMode ? picker.click() : fileDownload('quantum-ant-settings.json', area.value);
    buttons.append(close, download, primary);
    dialog.append(heading, note, area, warning, buttons, picker);
    mask.append(dialog);
    document.body.append(mask);
    mask.onclick = (event) => { if (event.target === mask) mask.remove(); };
  }

  function makeInput(item) {
    const value = read(config, item.path);
    let input;
    if (item.type === 'toggle') {
      input = element('input'); input.type = 'checkbox'; input.checked = !!value;
    } else if (item.type === 'select') {
      input = element('select');
      for (const [label, val] of item.options) {
        const option = element('option', '', label);
        option.value = String(val);
        input.append(option);
      }
      input.value = String(value);
    } else {
      input = element('input');
      input.type = item.type === 'range' ? 'range' : item.type === 'color' ? 'color' : item.type === 'number' ? 'number' : 'text';
      if (item.min !== undefined) input.min = String(item.min);
      if (item.max !== undefined) input.max = String(item.max);
      if (item.step !== undefined) input.step = String(item.step);
      input.value = String(value ?? '');
      if (item.type === 'text') input.autocomplete = 'off';
    }
    input.setAttribute('aria-label', item.label);
    input.title = item.tip ?? item.label;
    return input;
  }

  function formatValue(value, item) {
    if (typeof value !== 'number') return String(value);
    if (item.step && item.step < 1) return value.toFixed(item.step < 0.01 ? 3 : 2).replace(/0+$/, '').replace(/\.$/, '');
    return String(Math.round(value));
  }

  function updateVisibility() {
    const query = state.query.toLowerCase().trim();
    for (const row of rows) {
      const requires = row.item.requires;
      const visibleByDependency = !requires || (
        Array.isArray(requires) ? requires.every(([path, expected]) => read(config, path) === expected)
          : !!read(config, requires)
      );
      const found = !query || row.text.includes(query) || row.sectionName.includes(query);
      row.node.hidden = !visibleByDependency || !found;
    }
    for (const section of sections) {
      const has = section.rows.some(row => !row.node.hidden);
      section.node.hidden = !has && !!query;
      section.body.hidden = state.collapsed.has(section.name) && !query;
      section.button.setAttribute('aria-expanded', String(!section.body.hidden));
      section.button.querySelector('.chevron').textContent = section.body.hidden ? '▸' : '▾';
    }
  }

  function render() {
    const query = state.query;
    root.replaceChildren(); rows = []; sections = [];
    const top = element('div', 'editor-top');
    const intro = element('div', 'editor-intro', 'SIMULATION CONTROLS');
    const search = element('input', 'search');
    search.type = 'search'; search.placeholder = 'Search settings…'; search.value = query;
    search.setAttribute('aria-label', 'Search settings');
    search.oninput = () => { state.query = search.value; updateVisibility(); };
    top.append(intro, search);
    const presetRow = element('div', 'preset-row');
    const preset = element('select', 'preset-select');
    preset.setAttribute('aria-label', 'Choose a preset');
    const custom = element('option', '', 'Choose a preset…'); custom.value = '';
    preset.append(custom);
    presets.forEach(p => {
      const opt = element('option', '', p.name); opt.value = p.name; preset.append(opt);
    });
    preset.value = presets.some(p => p.name === state.activePreset) ? state.activePreset : '';
    preset.onchange = () => { if (preset.value) { state.activePreset = preset.value; onAction('preset', preset.value); render(); } };
    const surprise = element('button', 'small-button', 'Shuffle');
    surprise.title = 'Choose a random preset and seed';
    surprise.onclick = () => { onAction('shuffle'); state.activePreset = 'Custom'; render(); };
    presetRow.append(preset, surprise);
    const actions = element('div', 'editor-actions');
    const exp = element('button', 'small-button', 'Export');
    const imp = element('button', 'small-button', 'Import');
    const reset = element('button', 'small-button', 'Defaults');
    exp.onclick = () => showJsonDialog(false);
    imp.onclick = () => showJsonDialog(true);
    reset.onclick = () => { onAction('defaults'); state.activePreset = 'Custom'; render(); };
    actions.append(exp, imp, reset);
    root.append(top, presetRow, actions);

    for (const sectionInfo of schema) {
      const wrap = element('section', 'setting-section');
      const header = element('button', 'section-button');
      const title = element('span', '', sectionInfo.title);
      const arrow = element('span', 'chevron', '▾');
      const body = element('div', 'section-body');
      const section = { node: wrap, body, name: sectionInfo.title.toLowerCase(), button: header, rows: [] };
      header.type = 'button';
      header.title = sectionInfo.tip ?? '';
      header.append(title, arrow);
      header.onclick = () => {
        const id = section.name;
        if (state.collapsed.has(id)) state.collapsed.delete(id); else state.collapsed.add(id);
        updateVisibility();
      };
      wrap.append(header, body);
      for (const item of sectionInfo.fields) {
        const row = element('div', 'setting-row');
        if (item.type === 'toggle') row.classList.add('toggle-row');
        const label = element('label', 'setting-label', item.label);
        label.title = item.tip ?? item.label;
        const inputWrap = element('div', 'setting-input');
        const input = makeInput(item);
        input.id = 'setting-' + item.path.replaceAll('.', '-');
        label.htmlFor = input.id;
        const valueText = element('span', 'range-value', formatValue(read(config, item.path), item));
        inputWrap.append(input);
        if (item.type === 'range') inputWrap.append(valueText);
        row.append(label, inputWrap);
        if (item.tip) {
          const hint = element('span', 'setting-hint', '?');
          hint.title = item.tip;
          label.append(hint);
        }
        const commit = () => {
          let val = item.type === 'toggle' ? input.checked
            : ['range', 'number'].includes(item.type) ? Number(input.value)
              : input.value;
          if (item.path === 'simulation.rule') val = String(val).toUpperCase().replace(/[^RLSU]/g, '').slice(0, 32) || 'RL';
          if (item.path === 'simulation.rule') input.value = val;
          if (typeof val === 'number' && !Number.isFinite(val)) return;
          write(config, item.path, val);
          valueText.textContent = formatValue(val, item);
          state.activePreset = 'Custom';
          onChange(item.path, val);
          updateVisibility();
        };
        if (item.type === 'range' || item.type === 'color') input.addEventListener('input', commit);
        else input.addEventListener('change', commit);
        const rowItem = { node: row, item, text: (item.label + ' ' + (item.tip ?? '')).toLowerCase(), sectionName: section.name };
        section.rows.push(rowItem); rows.push(rowItem);
        body.append(row);
      }
      sections.push(section); root.append(wrap);
    }
    const footer = element('div', 'editor-footer', 'Click/tap a surface to paint · Shift-click to add an ant · Double-click to focus · H to hide controls');
    root.append(footer);
    updateVisibility();
  }
  render();
  return {
    render,
    refresh() { render(); },
    openExport() { showJsonDialog(false); },
    setPreset(name) { state.activePreset = name; render(); }
  };
}
