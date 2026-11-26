function mountSettings(config, defaults, options) {
    const css=document.createElement('style');
    css.textContent=`
#ri-editor {
    position:fixed;
    right:12px;
    top:12px;
    width:min(330px, calc(100vw - 24px));
    max-height:calc(100dvh - 24px);
    overflow:auto;
    background:#111426e8;
    color:#eee;
    border:1px solid #ffffff30;
    border-radius:12px;
    padding:12px;
    box-sizing:border-box;
    font:13px system-ui;
    backdrop-filter:blur(16px)
}
#ri-editor input, #ri-editor select, #ri-editor button {
    accent-color:#b47aff;
    color:#eee;
    background:#26283c;
    border:1px solid #ffffff25;
    border-radius:5px;
    padding:5px;
    min-width:0
}
#ri-editor input[type=range] {
    width:100%;
    padding:0
}
#ri-editor details {
    border-top:1px solid #ffffff20;
    padding:9px 0
}
#ri-editor summary {
    cursor:pointer;
    font-weight:600;
    text-transform:capitalize
}
#ri-editor label {
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:8px;
    align-items:center;
    margin:8px 0
}
#ri-editor .tools {
    display:flex;
    gap:5px;
    flex-wrap:wrap;
    margin:8px 0
}
#ri-editor .search {
    width:100%;
    box-sizing:border-box
}
`;
    document.head.append(css);
    const panel=document.createElement('aside');
    panel.id='ri-editor';
    document.body.append(panel);
    const header=document.createElement('div');
    header.style.cssText='display:flex;justify-content:space-between;align-items:center';
    header.innerHTML='<strong>Refractive Infinity</strong>';
    const toggle=document.createElement('button');
    toggle.textContent='Hide';
    header.append(toggle);
    panel.append(header);
    const body=document.createElement('div');
    panel.append(body);
    toggle.onclick=()=> {
        body.hidden=!body.hidden;
        toggle.textContent=body.hidden?'Show':'Hide';
    };
    const search=document.createElement('input');
    search.className='search';
    search.placeholder='Search settings';
    body.append(search);
    const tools=document.createElement('div');
    tools.className='tools';
    body.append(tools);
    const scenePicker = document.createElement('select');
    scenePicker.setAttribute('aria-label', 'Scene preset');
    scenePicker.add(new Option('Choose scene preset…', ''));
    for (const name of Object.keys(options.scenePresets)) {
        scenePicker.add(new Option(name, name));
    }
    scenePicker.onchange = () => {
        if (scenePicker.value) options.applyScene(scenePicker.value);
        build();
    };
    tools.append(scenePicker);
    const fields=document.createElement('div');
    body.append(fields);
    const ranges= {
        objectCount:[0, 1000, 1], speed:[0, 3, .05], spacing:[3, 10, .1], size:[.2, 1.4, .05], rotation:[0, 3, .05], morph:[0, 1, .01], orbit:[0, 1.5, .05], zoom:[.3, 4, .05], sensitivity:[.1, 3, .1], ior:[1.01, 2.5, .01], resolution:[.25, 1, .05], steps:[32, 192, 1], refractions:[1, 12, 1]
    };
    const descriptions= {
        simulation:'Procedural object geometry and movement', camera:'Automatic flight and pointer controls', material:'Optical surface properties and spectral highlights', effects:'Shader-based lighting and atmospheric approximations', performance:'GPU workload and adaptive resolution'
    };
    const labelFor=k=>k.replace(/([A-Z])/g, ' $1').replace(/^./, x=>x.toUpperCase());
    const groups = {
        'Surface Effects': ['iridescence','frost','luminousEdges','surfaceEngravings','dichroicCoating'],
        'Optical Effects': ['caustics','bloom'],
        'Energy Effects': ['plasma','core','shockwave','energyScanlines','resonanceWaves','coreHeartbeat'],
        'Environmental Effects': ['fog','cosmicDust','spectralDepth'],
        'Object Variation': ['objectPersonalities','breathingGeometry'],
        'Geometry Effects': ['deformation','distortion']
    };
    Object.assign(ranges, { intensity:[0,2,.01], thickness:[.02,.5,.01], pulseSpeed:[0,4,.05], scale:[1,24,.5], filmThickness:[.1,8,.1], saturation:[0,1,.01], colorShift:[0,6.28,.05], width:[.01,.45,.01], frequency:[.1,5,.05], wavelength:[1,40,.5], amplitude:[0,1,.01], variation:[0,1,.01], synchronization:[0,1,.01], density:[0,1,.01], brightness:[0,2,.01], driftSpeed:[0,3,.05], twinkle:[0,1,.01], distance:[1,80,1], transitionCurve:[.1,4,.1], colorVariation:[0,1,.01], brightnessVariation:[0,1,.01], rotationVariation:[0,1,.01], materialVariation:[0,1,.01], phaseVariation:[0,1,.01] });
    const choicesFor = key => ({geometry:options.geometries, arrangement:options.arrangements, preset:Object.keys(options.presets), pattern:['Grid','Hexagons','Rings','Circuit'], direction:['X','Y','Z']})[key];
    function limits(key,path) {
        if(path.includes('breathingGeometry') && key==='amplitude') return [0,.3,.01];
        if(path.includes('cosmicDust') && key==='size') return [.01,.25,.01];
        return ranges[key] || [0,2,.01];
    }
    function build() {
        const open = new Set([...fields.querySelectorAll('details[open]')].map(d=>d.dataset.section));
        const first = !fields.children.length;
        fields.replaceChildren();
        function section(parent,name,path) {
            const d=document.createElement('details');
            d.dataset.section=path;
            d.open=first ? path==='simulation' : open.has(path);
            const s=document.createElement('summary');
            s.textContent=labelFor(name);
            s.title=descriptions[name] || 'Configure '+labelFor(name);
            d.append(s); parent.append(d); return d;
        }
        function field(parent,obj,key,path) {
            const value=obj[key], row=document.createElement('label'), title=document.createElement('span');
            row.dataset.search=(path+' '+labelFor(key)).toLowerCase();
            row.title=labelFor(key)+' — '+path;
            if(key==='objectCount') row.title='Occupied cells per repeating 10 × 10 × 10 lattice block.';
            title.textContent=labelFor(key); row.append(title);
            let input=document.createElement('input');
            const choices=choicesFor(key);
            if(choices) {
                input=document.createElement('select');
                for(const v of choices) input.add(new Option(v,v));
                input.value=value;
            } else if(typeof value==='boolean') { input.type='checkbox'; input.checked=value; }
            else if(typeof value==='number') {
                input.type='range'; const [min,max,step]=limits(key,path);
                Object.assign(input,{min,max,step,value}); title.textContent+=': '+value;
            } else { input.type='color'; input.value=value; }
            input.oninput=()=>{
                scenePicker.value='';
                obj[key]=typeof value==='boolean'?input.checked:typeof value==='number'?Number(input.value):input.value;
                if(typeof value==='number') title.textContent=labelFor(key)+': '+obj[key];
                if(key==='preset') { options.applyPreset(input.value); build(); }
            };
            row.append(input); parent.append(row);
        }
        for(const [name,obj] of Object.entries(config)) {
            if(['editor','effects','features'].includes(name)) continue;
            const d=section(fields,name,name);
            for(const key of Object.keys(obj)) field(d,obj,key,name);
        }
        const root=section(fields,'Features','features');
        for(const [group,keys] of Object.entries(groups)) {
            const d=section(root,group,'features/'+group);
            for(const key of keys) {
                if(Object.hasOwn(config.effects,key)) field(d,config.effects,key,group);
                else {
                    const sub=section(d,key,'features/'+group+'/'+key);
                    for(const k of Object.keys(config.features[key])) field(sub,config.features[key],k,group+'/'+key);
                }
            }
        }
        fields.insertBefore(root,fields.querySelector('[data-section="performance"]'));
        filter();
    }
    function filter() {
        const q=search.value.toLowerCase();
        for(const r of fields.querySelectorAll('label')) {
            r.hidden=!r.dataset.search.includes(q); r.style.display=r.hidden?'none':'grid';
        }
        for(const d of [...fields.querySelectorAll('details')].reverse()) {
            d.hidden=![...d.querySelectorAll('label')].some(r=>!r.hidden);
            if(q&&!d.hidden)d.open=true;
        }
    }
    search.oninput=filter;
    function button(name, fn) {
        const b=document.createElement('button');
        b.textContent=name;
        b.onclick=fn;
        tools.append(b);
    }
    button('Randomize', () => {
        options.randomizeScene();
        scenePicker.value = '';
        build();
    });
    button('Reset', ()=> {
        scenePicker.value = '';
        for(const k of Object.keys(defaults))Object.assign(config[k], structuredClone(defaults[k])); build();
    });
    button('Export JSON', ()=> {
        const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([JSON.stringify(config, null, 2)], {
            type:'application/json'
        })); a.download='refractive-infinity.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href), 1000);
    });
    button('Import JSON', ()=> {
        const f=document.createElement('input'); f.type='file'; f.accept='.json,application/json'; f.onchange=async()=> {
            try {
                const data=JSON.parse(await f.files[0].text()); scenePicker.value='';
                function merge(target, schema, source, path='') {
                    for(const [k,v] of Object.entries(schema)) {
                        const n=source?.[k];
                        if(v && typeof v==='object') { merge(target[k],v,n,path+'/'+k); continue; }
                        if(typeof n!==typeof v) continue;
                        if(typeof n==='number' && Number.isFinite(n)) {
                            const [lo,hi]=limits(k,path); target[k]=Math.max(lo,Math.min(hi,['objectCount','steps','refractions'].includes(k)?Math.round(n):n));
                        } else if(typeof n==='boolean') target[k]=n;
                        else if(typeof n==='string' && (choicesFor(k)?.includes(n) || /^#[0-9a-f]{6}$/i.test(n) && v.startsWith('#'))) target[k]=n;
                    }
                }
                merge(config,defaults,data);
                build();
            } catch(e) {
                alert('Invalid settings: '+e.message);
            }
        }; f.click();
    });
    button('Show JSON', ()=> {
        const w=document.createElement('textarea'); w.value=JSON.stringify(config, null, 2); w.style.cssText='width:100%;height:220px;box-sizing:border-box'; const old=body.querySelector('textarea'); if(old)old.remove(); else body.append(w);
    });
    build();
}
