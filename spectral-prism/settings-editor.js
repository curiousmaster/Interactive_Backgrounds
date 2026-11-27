import defaults from './settings.js';
const copy = x => JSON.parse(JSON.stringify(x));
const choices = {
    sourceShape: ['laser', 'spotlight', 'orb', 'panel'],
    mode: ['physical', 'assisted', 'choreographed'], quality: ['auto', 'low', 'high'], shape: ['triangular', 'cube', 'tetrahedron', 'sphere', 'diamond', 'hexagonal', 'mixed'], distribution: ['cluster', 'grid', 'sphere', 'random'], material: ['crown', 'flint', 'quartz', 'diamond', 'custom'], type: ['white', 'mono', 'array', 'point', 'rotating', 'pulsed', 'pointer']
};
const ranges = {
    chamfer: [0, .35, .01], sourceSize: [.2, 3, .05],
    speed: [0, 4, .05], wavelengths: [4, 96, 1], maxBounces: [1, 16, 1], maxSegments: [100, 24000, 100], minEnergy: [.001, .1, .001], count: [1, 50, 1], size: [.2, 3, .05], variation: [0, 1, .05], rotationSpeed: [0, 90, 1], driftSpeed: [0, 2, .05], customIndex: [1, 3, .01], dispersion: [0, 5, .05], roughness: [0, 1, .01], opacity: [0, 1, .01], wavelength: [380, 780, 1], intensity: [0, 8, .1], width: [.005, .15, .005], pulseSpeed: [.1, 10, .1], absorption: [0, .5, .005], orbitSpeed: [0, 30, .5], zoom: [.3, 4, .05], tilt: [-80, 80, 1], fog: [0, .1, .001], strength: [0, 4, .05], radius: [0, 1, .01], threshold: [0, 2, .05], haloStrength: [0, 1, .01], dustCount: [0, 5000, 50], impactStrength: [0, 3, .05], trailLength: [.1, 3, .1], trailOpacity: [0, 1, .05]
};
const descriptions = {
    simulation: 'Ray budget, optical interaction depth and animation speed.', prisms: 'Geometry, material and independent motion.', light: 'Emitter spectrum, targeting and beam appearance.', optics: 'Physical interface behaviour and energy loss.', view: 'Camera projection and automatic orbit.', environment: 'Background and optical boundaries.', bloom: 'HDR glow post-processing.', effects: 'Atmospheric and artistic rendering layers.', controls: 'Interaction and diagnostics.', editor: 'Settings panel visibility.'
};
const presets = {
    'Dark Side': {
        prisms: {
            count: 1, rotation: false, drift: false
        }, light: {
            count: 1
        }, view: {
            orbit: false
        }, effects: {
            dust: false, trails: false
        }, simulation: {
            mode: 'physical'
        }
    },
    'Spectral Ballet': {
        prisms: {
            count: 3, rotationSpeed: 5
        }
    },
    'Crystal Constellation': {},
    'Diamond Fire': {
        prisms: {
            count: 5, shape: 'diamond', material: 'diamond'
        }
    },
    'Optical Laboratory': {
        simulation: {
            mode: 'physical'
        }, prisms: {
            count: 6, dispersion: 1
        }, effects: {
            halo: false, trails: false
        }
    },
    'Infinite Echoes': {
        prisms: {
            count: 8
        }, environment: {
            mirrors: true
        }
    },
    'Reverse Spectrum': {
        prisms: {
            count: 2, rotation: false, drift: false
        }, light: {
            count: 1
        }
    },
    'Spectral Storm': {
        prisms: {
            count: 25, rotationSpeed: 30
        }, light: {
            count: 4
        }
    },
    'Chromatic Galaxy': {
        prisms: {
            count: 40, distribution: 'sphere'
        }, simulation: {
            wavelengths: 24
        }
    },
    'Cathedral of Light': {
        prisms: {
            count: 16, distribution: 'grid'
        }, environment: {
            floor: true
        }, effects: {
            halo: true
        }
    },
    'Quantum Optics': {
        effects: {
            pulses: true, internalLight: true
        }, light: {
            pulse: true
        }
    },
    'Cinematic Spectrum': {
        effects: {
            flare: true, iridescence: true
        }, environment: {
            floor: true
        }
    }
};
const merge = (a, b) => { for (const k of Object.keys(a)) {
    if (b && Object.hasOwn(b, k)) {
        if (typeof a[k] === 'object')
            merge(a[k], b[k]);
        else if (typeof a[k] === typeof b[k])
            a[k] = b[k];
    }
} return a; };
export function mountSettings(config, onChange) {
    const panel = document.createElement('aside');
    panel.id = 'settings';
    document.body.append(panel);
    const toggle = document.createElement('button');
    toggle.id = 'settingsToggle';
    toggle.textContent = 'Settings';
    document.body.append(toggle);
    toggle.onclick = () => { panel.hidden = !panel.hidden; };
    panel.hidden = !config.editor.enabled;
    const label = k => k.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
    let selectedPreset = '';
    let searchQuery = '';
    const expanded = new Map();

    function apply(data, presetName = '') {
        selectedPreset = presetName;
        Object.assign(config, merge(copy(defaults), data));
        build();
        onChange('*');
    }
    function build() {
        panel.replaceChildren();
        const h = document.createElement('h2');
        h.textContent = 'Spectral Prism';
        panel.append(h);
        const search = document.createElement('input');
        search.placeholder = 'Search settings';
        search.type = 'text';
        search.setAttribute('aria-label', 'Search settings');
        search.value = searchQuery;
        const searchBar = document.createElement('div');
        searchBar.className = 'settings-search';
        const clearSearch = document.createElement('button');
        clearSearch.type = 'button';
        clearSearch.textContent = '×';
        clearSearch.title = 'Clear search';
        clearSearch.setAttribute('aria-label', 'Clear search');
        searchBar.append(search, clearSearch);
        panel.append(searchBar);
        const preset = document.createElement('select');
        preset.append(new Option('Choose preset', ''));
        Object.keys(presets).forEach(k => preset.append(new Option(k, k)));
        preset.value = selectedPreset;
        preset.onchange = () => {
            selectedPreset = preset.value;
            if (selectedPreset) {
                apply(presets[selectedPreset], selectedPreset);
            }
        };
        panel.append(preset);
        const sections = [];
        for (const [group, values] of Object.entries(config)) {
            const d = document.createElement('details');
            d.open = expanded.get(group) ?? ['simulation', 'prisms', 'bloom'].includes(group);
            d.dataset.group = group;
            expanded.set(group, d.open);
            d.addEventListener('toggle', () => {
                if (!searchQuery.trim() && d.isConnected) {
                    expanded.set(group, d.open);
                }
            });
            const s = document.createElement('summary');
            s.textContent = label(group);
            s.title = descriptions[group];
            d.append(s);
            sections.push(d);
            panel.append(d);
            for (const [key, value] of Object.entries(values)) {
                const row = document.createElement('label');
                row.className = 'setting';
                row.dataset.search = (group + ' ' + key + ' ' + label(key)).toLowerCase();
                const name = document.createElement('span');
                name.textContent = label(key);
                row.append(name);
                let input;
                if (choices[key]) {
                    input = document.createElement('select');
                    choices[key].forEach(v => input.append(new Option(label(v), v)));
                }
                else {
                    input = document.createElement('input');
                    input.type = typeof value === 'boolean' ? 'checkbox' : typeof value === 'number' ? 'range' : key === 'background' ? 'color' : 'text';
                    if (input.type === 'range') {
                        const r = group === 'light' && key === 'count' ? [1, 8, 1] : ranges[key] || [0, 10, .1];
                        [input.min, input.max, input.step] = r;
                    }
                }
                if (input.type === 'checkbox')
                    input.checked = value;
                else
                    input.value = value;
                const out = document.createElement('small');
                if (typeof value === 'number')
                    out.textContent = value;
                input.oninput = () => { const v = input.type === 'checkbox' ? input.checked : typeof value === 'number' ? Number(input.value) : input.value; config[group][key] = v; out.textContent = typeof v === 'number' ? v : ''; onChange(group + '.' + key); };
                row.append(input, out);
                d.append(row);
            }
        }
        function filterSettings() {
            searchQuery = search.value;
            const q = searchQuery.trim().toLowerCase();
            clearSearch.disabled = !searchQuery;
            for (const d of sections) {
                let matches = 0;
                for (const row of d.querySelectorAll('.setting')) {
                    row.hidden = !row.dataset.search.includes(q);
                    if (!row.hidden) matches++;
                }
                d.hidden = matches === 0;
                d.open = q ? matches > 0 : expanded.get(d.dataset.group);
            }
        }
        search.oninput = filterSettings;
        clearSearch.onclick = () => {
            search.value = '';
            filterSettings();
            search.focus();
        };
        filterSettings();
        const area = document.createElement('textarea');
        area.rows = 8;
        area.hidden = true;
        const buttons = document.createElement('div');
        buttons.className = 'buttons';
        for (const [name, fn] of [['Reset', () => apply({})], ['Show JSON', () => { area.hidden = !area.hidden; area.value = JSON.stringify(config, null, 2); }], ['Import', () => { if (area.hidden) {
                    area.hidden = false;
                    return;
                } try {
                    apply(JSON.parse(area.value));
                }
                catch (e) {
                    alert('Invalid JSON: ' + e.message);
                } }], ['Export', () => { const u = URL.createObjectURL(new Blob([JSON.stringify(config, null, 2)], {
                    type: 'application/json'
                })); const a = document.createElement('a'); a.href = u; a.download = 'spectral-prism-settings.json'; a.click(); setTimeout(() => URL.revokeObjectURL(u), 1000); }]]) {
            const b = document.createElement('button');
            b.textContent = name;
            b.onclick = fn;
            buttons.append(b);
        }
        panel.append(buttons, area);
    }
    build();
    return {
        refresh: build
    };
}