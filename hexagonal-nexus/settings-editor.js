import {
    defaults,
    presets,
    ranges,
    choices,
    descriptions,
    merge
}
from './settings.js';
export function mountSettings(config, apply) {
    const host = document.createElement('aside');
    host.id = 'settings';
    document.body.append(host);
    const toggle = document.createElement('button');
    toggle.id = 'settings-toggle';
    toggle.textContent = 'Settings';
    document.body.append(toggle);
    toggle.onclick = () => host.hidden = !host.hidden;
    const title = document.createElement('h2');
    title.textContent = 'Hexagonal Nexus';
    host.append(title);
    const search = document.createElement('input');
    search.placeholder = 'Search settings';
    host.append(search);
    const preset = document.createElement('select');
    for (const name of Object.keys(presets)) preset.add(new Option(name, name));
    host.append(preset);
    const bar = document.createElement('div');
    bar.className = 'toolbar';
    host.append(bar);
    const fields = document.createElement('div');
    host.append(fields);
    const json = document.createElement('textarea');
    json.hidden = true;
    host.append(json);
    function replace(next) {
        for (const k of Object.keys(config)) delete config[k];
        Object.assign(config, next);
        apply('all');
        render();
    }
    preset.onchange = () => replace(merge(defaults, presets[preset.value]));
    function button(name, fn) {
        const b = document.createElement('button');
        b.textContent = name;
        b.onclick = fn;
        bar.append(b);
    }
    button('Reset', () => replace(structuredClone(defaults)));
    button('Colors', () => {
        for (const k of ['color', 'accent', 'secondary']) config.material[k] = '#' + Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
        apply('material');
        render();
    });
    button('JSON', () => {
        json.hidden = !json.hidden;
        json.value = JSON.stringify(config, null, 2);
    });
    button('Import', () => {
        try {
            replace(merge(defaults, JSON.parse(json.value)));
        } catch (e) {
            alert(e.message);
        }
    });
    button('Export', () => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([JSON.stringify(config, null, 2)], {
            type: 'application/json'
        }));
        a.download = 'hexagonal-nexus.json';
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    const label = k => k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
    function render() {
        fields.replaceChildren();
        function walk(obj, parent, path = '') {
            for (const[k, v] of Object.entries(obj)) {
                const p = path ? path + '.' + k: k;
                if (typeof v === 'object') {
                    const d = document.createElement('details');
                    const s = document.createElement('summary');
                    s.textContent = label(k);
                    s.title = descriptions[p] || label(k);
                    d.append(s);
                    parent.append(d);
                    walk(v, d, p);
                    continue;
                }
                const row = document.createElement('label');
                row.dataset.search = p.toLowerCase();
                row.textContent = label(k);
                row.title = descriptions[p] || p;
                let input = document.createElement('input');
                if (choices[p]) {
                    input = document.createElement('select');
                    for (const c of choices[p]) input.add(new Option(c, c));
                    input.value = v;
                } else if (typeof v === 'boolean') {
                    input.type = 'checkbox';
                    input.checked = v;
                } else if (typeof v === 'number') {
                    input.type = 'range';
                    const r = ranges[p] || [0, Math.max(2, Math.abs(v) * 3), 0.01];
                    [input.min, input.max, input.step] = r;
                    input.value = v;
                } else {
                    input.type = 'text';
                    input.value = v;
                }
                const output = document.createElement('small');
                if (typeof v === 'number') output.textContent = v;
                input.oninput = () => {
                    let n = input.type === 'checkbox' ? input.checked: typeof v === 'number' ? Number(input.value): input.value;
                    obj[k] = n;
                    output.textContent = typeof v === 'number' ? n: '';
                    apply(p);
                };
                row.append(input, output);
                parent.append(row);
            }
        }
        walk(config, fields);
        filter();
    }
    function filter() {
        const q = search.value.toLowerCase();
        for (const r of fields.querySelectorAll('label')) r.hidden = !r.dataset.search.includes(q);
        for (const d of [... fields.querySelectorAll('details')].reverse()) {
            d.hidden = !!q && ![... d.querySelectorAll('label')].some(r => !r.hidden);
            if (q && !d.hidden) d.open = true;
        }
    }
    search.oninput = filter;
    render();
}