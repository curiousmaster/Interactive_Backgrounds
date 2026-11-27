import defaults from './settings.js';
const copy = x => JSON.parse(JSON.stringify(x));
const choices = {
    source:["procedural","image","none"], fallback:["procedural","none"], animationAxis:["x","y","z"],
    colorMode: ['fixed','spectral','iridescent','material'], axis:['x','y','z'], pattern:['orbit','oscillate'],
    preset:['Dark Side','Soft Studio','Hard Studio','Neon','Laboratory','Cinematic','Cosmic','Rainbow','High Contrast','Custom'],
    style: ['studio', 'strip-lights', 'laboratory', 'neon', 'cosmic', 'dark', 'rainbow'],
    sourceShape: ['laser', 'spotlight', 'orb', 'panel'],
    mode: ['physical', 'assisted', 'choreographed'], quality: ['auto', 'low', 'high'], shape: ['triangular', 'cube', 'tetrahedron', 'sphere', 'diamond', 'hexagonal', 'mixed'], distribution: ['cluster', 'grid', 'sphere', 'random'], material: ['crown', 'flint', 'quartz', 'diamond', 'custom'], type: ['white', 'mono', 'array', 'point', 'rotating', 'pulsed', 'pointer']
};
const ranges = {
    thickness:[.5,8,.1], glowIntensity:[0,2,.05], masterIntensity:[0,3,.05], exposure:[.1,3,.05], verticalRotation:[-180,180,1], blur:[0,.5,.01], brightness:[0,10,.1], temperature:[2000,10000,100], spread:[0,180,1], height:[-15,15,.1], speedVariation:[0,2,.05], falloff:[.5,10,.1], resolution:[512,2048,512], softness:[0,8,.1], bias:[-.01,.01,.0001],
    chamfer: [0, .35, .01], sourceSize: [.2, 3, .05],
    speed: [0, 4, .05], wavelengths: [4, 96, 1], maxBounces: [1, 16, 1], maxSegments: [100, 24000, 100], minEnergy: [.001, .1, .001], count: [1, 50, 1], size: [.2, 3, .05], variation: [0, 1, .05], rotationSpeed: [0, 90, 1], driftSpeed: [0, 2, .05], customIndex: [1, 3, .01], dispersion: [0, 5, .05], roughness: [0, 1, .01], opacity: [0, 1, .01], wavelength: [380, 780, 1], intensity: [0, 8, .1], width: [.005, .15, .005], pulseSpeed: [.1, 10, .1], absorption: [0, .5, .005], orbitSpeed: [0, 30, .5], zoom: [.3, 4, .05], tilt: [-80, 80, 1], fog: [0, .1, .001], strength: [0, 4, .05], radius: [0, 1, .01], threshold: [0, 2, .05], haloStrength: [0, 1, .01], dustCount: [0, 5000, 50], impactStrength: [0, 3, .05], trailLength: [.1, 3, .1], trailOpacity: [0, 1, .05]
};
const descriptions = {
    edges: "Independent wide-line outlines and glow.",
    environmentalLighting: 'Independent scene illumination and surface reflections.', simulation: 'Ray budget, optical interaction depth and animation speed.', prisms: 'Geometry, material and independent motion.', light: 'Emitter spectrum, targeting and beam appearance.', optics: 'Physical interface behaviour and energy loss.', view: 'Camera projection and automatic orbit.', environment: 'Background and optical boundaries.', bloom: 'HDR glow post-processing.', effects: 'Atmospheric and artistic rendering layers.', controls: 'Interaction and diagnostics.', editor: 'Settings panel visibility.'
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
            mirrors: false
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
// Environmental reflection configuration for each preset.
const reflectionFiles = [
    'none', 'sunset', 'studio', 'studio', 'studio', 'neon',
    'none', 'neon', 'neon', 'studio', 'neon', 'sunset'
];
const reflectionIntensities = [1.5, 1.2, 1.5, 2.0, 0.8, 1.5, 1.5, 2.0, 1.2, 1.8, 1.5, 1.5];
const reflectionOpacities = [0.65, 0.45, 0.65, 0.80, 0.30, 0.65, 0.65, 0.75, 0.50, 0.65, 0.55, 0.70];
const animatedPresets = [5, 7, 8, 10, 11];
const animationSpeeds = {5: 2, 7: 8, 8: 1, 10: 4, 11: 0.5};

Object.values(presets).forEach((preset, i) => {
    const file = reflectionFiles[i];
    preset.edges = { ...preset.edges, enabled: false };
    preset.environment = { ...preset.environment, mirrors: false };
    preset.environmentalLighting = {
        ...preset.environmentalLighting,
        reflectionEnvironment: {
            enabled: file !== 'none',
            source: 'image',
            file: file === 'none' ? 'neon.png' : file + '.png',
            intensity: reflectionIntensities[i],
            reflectionOpacity: reflectionOpacities[i],
            animate: animatedPresets.includes(i),
            animationSpeed: animationSpeeds[i] ?? 2
        }
    };
});

// Inherit the current defaults, but explicitly disable mirrors and edges.
const defaultPreset = copy(defaults);
defaultPreset.environment.mirrors = false;
defaultPreset.edges.enabled = false;
const orderedPresets = { Default: defaultPreset, ...presets };
const merge = (a, b) => { for (const k of Object.keys(a)) {
    if (b && Object.hasOwn(b, k)) {
        if (typeof a[k] === 'object')
            merge(a[k], b[k]);
        else if (typeof a[k] === typeof b[k])
            a[k] = b[k];
    }
} return a; };
export function mountSettings(config, onChange) {
    let catalog = [];
    fetch("./environments/environments.json").then(r=>r.ok?r.json():[]).then(items=>{ catalog=Array.isArray(items)?items:[]; build(); }).catch(()=>{});
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
    let selectedPreset = 'Default';
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
        Object.keys(orderedPresets).forEach(k => preset.append(new Option(k, k)));
        preset.value = selectedPreset;
        preset.onchange = () => {
            selectedPreset = preset.value;
            if (selectedPreset) {
                apply(orderedPresets[selectedPreset], selectedPreset);
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
            function addRows(values, parent, path) {
            for (const [key, value] of Object.entries(values)) {
                if (value && typeof value === 'object') {
                    const sub = document.createElement('details');
                    const heading = document.createElement('summary');
                    heading.textContent = label(key);
                    sub.append(heading);
                    sub.dataset.group = [...path, key].join('.');
                    sub.open = expanded.get(sub.dataset.group) ?? false;
                    expanded.set(sub.dataset.group, sub.open);
                    sub.addEventListener('toggle', () => {
                        if (!searchQuery.trim() && sub.isConnected) expanded.set(sub.dataset.group, sub.open);
                    });
                    parent.append(sub);
                    addRows(value, sub, [...path, key]);
                    if(key==='reflectionEnvironment') {
                        const status=document.createElement('div'); status.className='reflection-status';
                        const preview=document.createElement('img'); preview.style.cssText='width:100%;border-radius:4px;display:none'; preview.alt='Selected environment panorama';
                        const retry=document.createElement('button'); retry.textContent='Retry environment'; retry.onclick=()=>window.retryReflection?.();
                        sub.append(status,preview,retry);
                        const refresh=()=>{ if(!status.isConnected)return; const st=window.reflectionStatus||{}; status.textContent=`Texture: ${st.state||'idle'} | Active: ${st.active||'none'} | Attempts: ${st.attempts||0}${st.error?' | '+st.error:''}`; const file=config.environmentalLighting.reflectionEnvironment.file; const show=config.environmentalLighting.reflectionEnvironment.showPreview && /\.(webp|png|jpe?g)$/i.test(file); preview.style.display=show?'block':'none'; if(show && preview.dataset.file!==file){preview.dataset.file=file;preview.src='./environments/'+encodeURIComponent(file);} setTimeout(refresh,500); }; refresh();
                    }
                    continue;
                }
                const row = document.createElement('label');
                row.className = 'setting';
                row.dataset.search = (path.map(label).join(' ') + ' ' + key + ' ' + label(key)).toLowerCase();
                const name = document.createElement('span');
                name.textContent = label(key);
                row.append(name);
                let input;
                if (key === "file" && path.includes("reflectionEnvironment")) {
                    input = document.createElement("select");
                    input.append(new Option("Select panorama", ""));
                    for (const item of catalog) if (typeof item.file === "string" && typeof item.name === "string") input.append(new Option(item.name,item.file));
                    if (value && !catalog.some(x=>x.file===value)) input.append(new Option(value+" (missing)",value));
                } else if (path[0] === "transmission" && key === "mode") {
                    input = document.createElement("select");
                    ["classic", "physical", "advanced"].forEach(v => input.append(new Option(label(v), v)));
                } else if (choices[key]) {
                    input = document.createElement('select');
                    choices[key].forEach(v => input.append(new Option(label(v), v)));
                }
                else {
                    input = document.createElement('input');
                    input.type = typeof value === 'boolean' ? 'checkbox' : typeof value === 'number' ? 'range' : /^#[0-9a-f]{6}$/i.test(value) ? 'color' : 'text';
                    if (input.type === 'range') {
                        const specific = path.join('.') === 'environmentalLighting.rim' && key === 'width' ? [.01,1,.01] : path.join('.') === 'environmentalLighting.directional' && key === 'count' ? [1,4,1] : path.join('.') === 'environmentalLighting.studioPanels' && key === 'count' ? [1,32,1] : null;
                        const special = group === 'environmentalLighting' ? {count:[1,8,1], radius:[.1,25,.1], rotation:[0,360,1], azimuth:[-180,180,1], elevation:[-90,90,1], distance:[1,50,1], decay:[0,2,.1], power:[.5,8,.1]}[key] : null;
                        const reflectionRange = path.includes("reflectionEnvironment") ? {reflectionOpacity:[0,1,.01],reflectionStrength:[0,8,.05],reflectionRoughness:[0,1,.01],fresnelPower:[.1,10,.1],minReflectivity:[0,1,.01],maxReflectivity:[0,1,.01],chamferBoost:[0,4,.05],rotationX:[-180,180,1],rotationY:[-180,180,1],rotationZ:[-180,180,1],animationSpeed:[-30,30,.5],maxResolution:[256,2048,256],saturation:[0,2,.05],contrast:[0,2,.05],blur:[0,1,.01]}[key] : null;
                        const transmissionRange = path[0] === "transmission" ? {intensity:[0,2,.05],thickness:[0,4,.05],ior:[1,2.5,.01],dispersion:[0,.2,.005],roughness:[0,1,.01],absorption:[0,1,.005],maxLayers:[1,4,1],resolutionScale:[.25,1,.05]}[key] : null;
                        const r = transmissionRange || reflectionRange || specific || special || (group === 'light' && key === 'count' ? [1, 8, 1] : ranges[key] || [0, 10, .1]);
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
                input.oninput = () => { const v = input.type === 'checkbox' ? input.checked : typeof value === 'number' ? Number(input.value) : input.value; values[key] = v;
                    if (path.includes("reflectionEnvironment") && key === "file" && v) { values.source = "image"; build(); onChange([...path,key].join(".")); return; }
                    if (group === 'environmentalLighting' && key === 'preset' && v !== 'Custom') {
                        const styles = {'Dark Side':['dark',.15,.1], 'Soft Studio':['studio',.8,.25], 'Hard Studio':['strip-lights',1.2,.03], Neon:['neon',1,.08], Laboratory:['laboratory',.8,.12], Cinematic:['studio',1.3,.05], Cosmic:['cosmic',.6,.08], Rainbow:['rainbow',1,.1], 'High Contrast':['strip-lights',1.5,.02]};
                        const [style,intensity,roughness] = styles[v];
                        const l = config.environmentalLighting;
                        Object.assign(l, copy(defaults.environmentalLighting), {preset:v});
                        Object.assign(l.environment,{style,intensity});
                        l.specular.roughness = roughness;
                        l.ambient.intensity = v === 'Dark Side' ? .03 : .15;
                        build(); onChange('environmentalLighting.preset'); return;
                    }
                    if (group === 'environmentalLighting' && key !== 'preset') {
                        config.environmentalLighting.preset = 'Custom';
                        const selector = panel.querySelector('[data-search="environmental lighting preset preset"] select');
                        if (selector) selector.value = 'Custom';
                    }
                    out.textContent = typeof v === 'number' ? v : ''; onChange([...path, key].join('.')); };
                row.append(input, out);
                parent.append(row);
            }
            }
            addRows(values, d, [group]);
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
                for (const sub of d.querySelectorAll('details')) {
                    const visible = [...sub.querySelectorAll('.setting')].some(row => !row.hidden);
                    sub.hidden = !visible;
                    sub.open = q ? visible : expanded.get(sub.dataset.group);
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
