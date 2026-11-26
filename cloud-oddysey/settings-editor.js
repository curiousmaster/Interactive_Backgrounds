const ranges = { speed: [0, 150, .5], altitude: [0, 600, 1], turbulence: [0, 2, .01], banking: [0, 2, .01], fov: [30, 110, 1], zoom: [.5, 3, .01], sensitivity: [.1, 3, .01], coverage: [0, 1, .01], density: [0, 4, .01], scale: [.2, 4, .01], base: [0, 400, 1], thickness: [20, 400, 1], evolution: [0, 2, .01], fog: [0, 2, .01], scattering: [0, 2, .01], visibility: [200, 4000, 10], azimuth: [0, 360, 1], intensity: [0, 4, .01], wind: [0, 60, .5], direction: [0, 360, 1], hour: [0, 24, .01], height: [0, 400, 1], roughness: [.1, 4, .01], resolution: [.25, 1, .05], steps: [8, 128, 1] };
const choices = { formation: ['cumulus', 'cirrus', 'stratus', 'storm'], quality: ['performance', 'high', 'ultra'] };
const hints = { flight: 'Camera movement, altitude and automatic steering.', view: 'Camera projection and steering sensitivity.', clouds: 'Procedural cloud volume, shape and evolution.', atmosphere: 'Sky colors, haze and maximum ray distance.', lighting: 'Directional sunlight and approximate cloud self-shadowing.', weather: 'Wind, screen-space precipitation and lightning flashes.', timeline: 'Time of day and automatic solar cycle.', terrain: 'Procedural height-field mountains.', effects: 'Approximate atmospheric optical effects.', performance: 'Rendering resolution and ray-marching quality.', hud: 'Flight information overlay.', editor: 'Settings panel visibility.' };
export function mountSettings({ config, defaults, presets }) { const root = document.querySelector('#editor'), open = document.querySelector('#open'); const el = (tag, text) => { const x = document.createElement(tag); if (text)
    x.textContent = text; return x; }; const title = s => s.replace(/([A-Z])/g, ' $1').replace(/^./, x => x.toUpperCase()); let controls = []; function merge(dst, src, base) { for (const k of Object.keys(base)) {
    if (!(k in src))
        continue;
    const v = src[k], b = base[k];
    if (b && typeof b === 'object') {
        if (v && typeof v === 'object')
            merge(dst[k], v, b);
    }
    else if (typeof v === typeof b) {
        if (typeof b === 'number') {
            const r = k === 'speed' && base === defaults.timeline ? [0, 2, .01] : ranges[k] || [0, 1, .01];
            if (Number.isFinite(v))
                dst[k] = Math.max(r[0], Math.min(r[1], v));
        }
        else if (typeof b === 'string') {
            if (choices[k] ? choices[k].includes(v) : /^#[0-9a-f]{6}$/i.test(v))
                dst[k] = v;
        }
        else
            dst[k] = v;
    }
} } function reset() { for (const k of Object.keys(defaults))
    Object.assign(config[k], structuredClone(defaults[k])); } function show(v) { config.editor.enabled = v; root.hidden = !v; open.hidden = v; } function sync() { for (const { input, out, group, key } of controls) {
    const v = config[group][key];
    if (document.activeElement !== input) {
        if (input.type === 'checkbox')
            input.checked = v;
        else
            input.value = v;
    }
    out.textContent = typeof v === 'number' ? Number(v.toFixed(2)) : '';
} } const header = el('header'); header.append(el('strong', 'Cloud Odyssey')); const close = el('button', 'Hide'); close.onclick = () => show(false); header.append(close); root.append(header); open.onclick = () => show(true); const tools = el('div'); tools.className = 'tools'; const preset = el('select'); preset.append(new Option('Select preset', '')); for (const name of Object.keys(presets))
    preset.append(new Option(name, name)); preset.onchange = () => { if (!preset.value)
    return; reset(); merge(config, presets[preset.value], defaults); sync(); show(true); }; tools.append(preset); function button(name, fn) { const b = el('button', name); b.onclick = fn; tools.append(b); } button('Reset', () => { reset(); sync(); show(true); preset.value = ''; }); button('Export JSON', () => { const url = URL.createObjectURL(new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })); const a = el('a'); a.href = url; a.download = 'cloud-odyssey.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }); const file = el('input'); file.type = 'file'; file.accept = '.json,application/json'; file.hidden = true; file.onchange = async () => { try {
    const data = JSON.parse(await file.files[0].text());
    if (!data || typeof data !== 'object' || Array.isArray(data))
        throw Error('Expected a settings object');
    merge(config, data, defaults);
    sync();
    show(config.editor.enabled);
}
catch (e) {
    alert('Invalid settings: ' + e.message);
} file.value = ''; }; button('Import JSON', () => file.click()); tools.append(file); root.append(tools); const search = el('input'); search.type = 'search'; search.placeholder = 'Search settings'; search.style.width = '100%'; root.append(search); const sections = []; for (const [group, values] of Object.entries(config)) {
    const section = el('details');
    const summary = el('summary', title(group));
    summary.title = hints[group] || '';
    section.append(summary);
    section.open = group === 'flight';
    const rows = [];
    for (const [key, value] of Object.entries(values)) {
        const label = el('label');
        label.title = `${title(group)}: ${title(key)}`;
        label.append(el('span', title(key)));
        let input = el(choices[key] ? 'select' : 'input');
        const out = el('output');
        if (choices[key])
            for (const v of choices[key])
                input.append(new Option(title(v), v));
        else if (typeof value === 'boolean')
            input.type = 'checkbox';
        else if (typeof value === 'number') {
            input.type = 'range';
            const r = group === 'timeline' && key === 'speed' ? [0, 2, .01] : ranges[key] || [0, 1, .01];
            [input.min, input.max, input.step] = r;
        }
        else
            input.type = 'color';
        input.oninput = () => { config[group][key] = typeof value === 'boolean' ? input.checked : typeof value === 'number' ? Number(input.value) : input.value; sync(); if (group === 'editor')
            show(config.editor.enabled); };
        label.append(input, out);
        section.append(label);
        rows.push({ label, key });
        controls.push({ input, out, group, key });
    }
    root.append(section);
    sections.push({ section, group, rows });
} search.oninput = () => { const q = search.value.toLowerCase(); for (const { section, group, rows } of sections) {
    let any = false;
    for (const { label, key } of rows) {
        const match = (group + ' ' + key + ' ' + title(key)).toLowerCase().includes(q);
        label.style.display = match ? '' : 'none';
        any ||= match;
    }
    section.hidden = !any;
    if (q && any)
        section.open = true;
} }; sync(); show(config.editor.enabled); setInterval(sync, 350); }