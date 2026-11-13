
/* Chromatic Reflections 3D — live settings editor, no dependencies. */
(() => {
'use strict';
// Compact schema helpers; all settings are exported/imported as plain JSON.
const R=(path,label,min,max,step=.01,unit='',when)=>({path,label,min,max,step,unit,when});
const B=(path,label,when)=>({path,label,type:'checkbox',when});
const C=(path,label,when)=>({path,label,type:'color',when});
const S=(path,label,options,when)=>({path,label,type:'select',options,when});
const active=name=>c=>c.features[name].enabled;
const SCHEMA=[
 {title:'Spheroid / Boundary',fields:[
  S('geometry.type','Spheroid type', [['prolate','Prolate / rugby ball'],['rotated','Rotated spheroid'],['eccentric','Eccentric spheroid'],['confocal','Confocal spheroids'],['sphere','Sphere (one focus)'],['slender','Slender prolate'],['animated','Animated glass'],['twin','Twin spheroids']]),
  R('geometry.aspect','Minor / major radius',.22,.98,.01,'',c=>!['sphere','eccentric'].includes(c.geometry.type)),
  R('geometry.eccentricity','Eccentricity',.05,.97,.01,'',c=>c.geometry.type==='eccentric'),
  R('geometry.size','Object size',.55,1.2,.01),R('geometry.rotation','Geometry roll',-180,180,1,'°'),
  R('geometry.pulse','Breathing amplitude',0,.2,.005,'',c=>c.geometry.type==='animated'),
  R('geometry.pulseSpeed','Breathing frequency',.02,2,.02,'Hz',c=>c.geometry.type==='animated'),
  R('geometry.rotateSpeed','Spin speed',-35,35,.5,'°/s',c=>c.geometry.type==='animated'),
  R('geometry.twinGap','Twin gap',0,.5,.01,'',c=>c.geometry.type==='twin'),
  B('geometry.showBoundary','Visible glass boundary'),
  R('geometry.boundaryWidth','Boundary line width',.3,4,.05,'px',c=>c.geometry.showBoundary),
  B('geometry.showFoci','Show both foci')
 ]},
 {title:'Particles / Physics',fields:[
  R('particles.max','Max balls before reset',2,512,1),R('particles.speed','Particle speed',.1,4,.05),
  R('particles.speedVariation','Speed variation',0,.5,.01),R('particles.splitAngle','3D split angle',0,90,.5,'°'),
  R('particles.resetDelay','Hold at maximum',0,5,.1,'s'),
  S('particles.emitter','Start focus',[['a','Focus A'],['b','Focus B'],['alternate','Alternate each cycle']]),
  S('particles.distribution','Seed direction',[['golden','Golden spiral'],['random','Random 3D'],['fan','3D fan'],['fixed','Fixed']]),
  R('particles.azimuth','Seed azimuth',-180,180,1,'°'),R('particles.elevation','Seed elevation',-89,89,1,'°'),
  R('particles.spread','Seed fan spread',0,180,1,'°',c=>c.particles.distribution==='fan'),
  R('particles.size','Particle glow size',.5,8,.1,'px'),B('particles.showBodies','Show particle cores')
 ]},
 {title:'Camera / View',fields:[
  R('view.yaw','Camera yaw',-180,180,1,'°'),R('view.tilt','Camera elevation',-80,80,1,'°'),
  R('view.roll','Camera roll',-180,180,1,'°'),R('view.zoom','Zoom',.5,1.65,.01),
  B('view.perspective','Perspective depth'),R('view.distance','Camera distance',2.4,8,.1,'',c=>c.view.perspective),
  B('view.orbit','Auto-orbit'),R('view.orbitSpeed','Orbit speed',-45,45,.5,'°/s',c=>c.view.orbit)
 ]},
 {title:'Trails',fields:[
  B('trails.enabled','Enable trails'),
  R('trails.length','Trail length (3D distance)',.1,12,.1,'units',c=>c.trails.enabled),
  R('trails.fadePower','Distance fade curve',.3,5,.05,'',c=>c.trails.enabled),
  R('trails.lifetime','Trail lifetime',.3,45,.1,'s',c=>c.trails.enabled),
  R('trails.width','Line width',.2,4,.05,'px',c=>c.trails.enabled),
  R('trails.brightness','Brightness',.05,2,.05,'',c=>c.trails.enabled),B('trails.additive','Additive blending',c=>c.trails.enabled)
 ]},
 {title:'Colors',fields:[
  S('colors.mode','Color mode',[['rainbow','Rainbow'],['dual','Two foci'],['generation','Generation'],['depth','3D depth'],['bounce','Reflections'],['speed','Particle speed'],['mono','Single hue']]),
  R('colors.hue','Base hue',0,360,1,'°',c=>c.colors.mode!=='dual'),R('colors.hueSpread','Hue spread',0,360,1,'°',c=>!['dual','mono'].includes(c.colors.mode)),
  R('colors.saturation','Saturation',0,1,.01,'',c=>c.colors.mode!=='dual'),R('colors.lightness','Lightness',.15,.85,.01,'',c=>c.colors.mode!=='dual'),
  R('colors.hueDrift','Hue drift',-25,25,.5,'°/s',c=>c.colors.mode!=='dual'),
  C('colors.focusA','Focus A color',c=>c.geometry.showFoci||c.colors.mode==='dual'),
  C('colors.focusB','Focus B color',c=>c.geometry.showFoci||c.colors.mode==='dual'),
  C('colors.boundary','Shell color',c=>c.geometry.showBoundary||c.features.confocalGuides||c.features.axes||c.geometry.type==='confocal')
 ]},
 {title:'Lighting / Background',fields:[
  B('lighting.bloom','Bloom'),R('lighting.bloomStrength','Bloom intensity',0,3,.05,'',c=>c.lighting.bloom),
  R('lighting.bloomRadius','Bloom radius',.2,8,.1,'',c=>c.lighting.bloom),
  B('lighting.boundaryGlow','Glowing shell',c=>c.geometry.showBoundary),B('lighting.focusGlow','Glowing focus cores',c=>c.geometry.showFoci),
  C('scene.background','Background color'),R('scene.stars','Star field',0,1,.05),R('scene.vignette','Vignette',0,1,.05)
 ]},
 {title:'Interaction',fields:[
  B('interaction.enabled','Pointer / touch'),B('interaction.dragRotate','Drag to orbit',c=>c.interaction.enabled),
  B('interaction.wheelZoom','Mouse wheel / pinch zoom',c=>c.interaction.enabled),
  B('interaction.clickBurst','Click to add balls',c=>c.interaction.enabled),
  R('interaction.burstCount','Manual burst count',1,64,1),
  B('interaction.showAim','Show pointer aiming ring',c=>c.interaction.enabled)
 ]},
 {title:'Features',fields:[
  B('features.confocalGuides','Confocal spheroid guides'),
  R('features.guideCount','Confocal guide layers',1,8,1,'',c=>c.features.confocalGuides||c.geometry.type==='confocal'),
  B('features.axes','Three principal axes'),B('features.focusPulse','Subtle focus-ring pulse',c=>c.geometry.showFoci),
  B('features.endpointFlashes','Boundary and focus sparks'),B('features.directionMarkers','Particle direction markers'),
  B('features.shell.enabled','Transparent spheroid shell',c=>c.geometry.showBoundary),
  R('features.shell.meridians','Meridian strands',2,28,1,'',c=>c.geometry.showBoundary&&active('shell')(c)),
  R('features.shell.parallels','Latitude rings',0,24,1,'',c=>c.geometry.showBoundary&&active('shell')(c)),
  R('features.shell.opacity','Shell opacity',.05,1,.025,'',c=>c.geometry.showBoundary&&active('shell')(c)),
  R('features.shell.fresnel','Rim / Fresnel power',.3,5,.05,'',c=>c.geometry.showBoundary&&active('shell')(c)),
  B('features.haze.enabled','Volumetric depth haze'),
  R('features.haze.density','Haze density',0,1,.05,'',active('haze')),
  R('features.haze.brightness','Haze glow',0,2,.05,'',active('haze')),
  R('features.haze.depthFade','Depth attenuation',0,1,.05,'',active('haze')),
  B('features.focusCores.enabled','Pulsing energy foci',c=>c.geometry.showFoci),
  R('features.focusCores.size','Core size',.3,3,.05,'',c=>c.geometry.showFoci&&active('focusCores')(c)),
  R('features.focusCores.pulse','Core pulse amplitude',0,1,.05,'',c=>c.geometry.showFoci&&active('focusCores')(c)),
  B('features.silk.enabled','Chromatic silk'),
  R('features.silk.filamentWidth','Filament width',.1,2,.05,'px',active('silk')),
  R('features.silk.silkOpacity','Silk opacity',0,1,.025,'',active('silk')),
  R('features.silk.iridescence','Iridescence',0,3,.05,'',active('silk')),
  R('features.silk.strandGlow','Strand glow',0,2,.05,'',active('silk')),
  B('features.shockwaves.enabled','3D focal shockwave spheres'),
  R('features.shockwaves.waveSpeed','Wave speed',.1,2,.05,'',active('shockwaves')),
  R('features.shockwaves.waveRadius','Maximum radius',.1,2,.05,'',active('shockwaves')),
  R('features.shockwaves.intensity','Wave brightness',0,3,.05,'',active('shockwaves')),
  R('features.shockwaves.decay','Wave decay',.1,5,.1,'',active('shockwaves')),
  R('features.shockwaves.distortion','Spherical wave distortion',0,2,.05,'',active('shockwaves')),
  B('features.spectral.enabled','Spectral dispersion'),
  R('features.spectral.dispersion','Prism strength',0,3,.05,'',active('spectral')),
  R('features.spectral.chromaticShift','Chromatic shift',0,12,.1,'px',active('spectral')),
  R('features.spectral.spectralGlow','Spectral glow',0,2,.05,'',active('spectral')),
  R('features.spectral.wavelengthSpread','Wavelength separation',.1,3,.05,'',active('spectral')),
  B('features.ribbons.enabled','3D ribbon filaments'),
  R('features.ribbons.ribbonWidth','Ribbon width',.5,8,.1,'px',active('ribbons')),
  R('features.ribbons.twist','Ribbon twist',0,8,.1,'',active('ribbons')),
  R('features.ribbons.depth','Ribbon depth',0,.3,.005,'',active('ribbons')),
  R('features.ribbons.edgeGlow','Ribbon edge glow',0,2,.05,'',active('ribbons')),
  R('features.ribbons.perspective','Depth thickness response',0,2,.05,'',c=>c.view.perspective&&active('ribbons')(c)),
  B('features.livingBoundary.enabled','Living glass boundary',c=>c.geometry.showBoundary),
  R('features.livingBoundary.surfaceRipple','Impact ripple',0,.1,.002,'',c=>c.geometry.showBoundary&&active('livingBoundary')(c)),
  R('features.livingBoundary.refraction','Glass ghost highlight',0,2,.05,'',c=>c.geometry.showBoundary&&active('livingBoundary')(c)),
  R('features.livingBoundary.edgeThickness','Rim edge thickness',.5,3,.05,'',c=>c.geometry.showBoundary&&active('livingBoundary')(c)),
  R('features.livingBoundary.impactGlow','Impact glow',0,3,.05,'',c=>c.geometry.showBoundary&&active('livingBoundary')(c)),
  B('features.kaleidoscope.enabled','Kaleidoscopic projection'),
  R('features.kaleidoscope.symmetryCount','Symmetry sectors',2,18,1,'',active('kaleidoscope')),
  S('features.kaleidoscope.mirrorMode','Symmetry mode',[['mirror','Mirrored sectors'],['repeat','Repeated sectors']],active('kaleidoscope')),
  R('features.kaleidoscope.rotationOffset','Sector rotation',-180,180,1,'°',active('kaleidoscope')),
  R('features.kaleidoscope.blendStrength','Mirror blend',0,1,.05,'',active('kaleidoscope')),
  B('features.lineage.enabled','3D fractal lineage'),
  R('features.lineage.generationHue','Hue per generation',-90,90,1,'°',c=>c.colors.mode!=='dual'&&active('lineage')(c)),
  R('features.lineage.thicknessDecay','Width decay',.5,1.15,.025,'',active('lineage')),
  R('features.lineage.brightnessDecay','Brightness decay',.5,1.15,.025,'',active('lineage')),
  R('features.lineage.lineageGlow','Lineage aura',0,2,.05,'',active('lineage')),
  B('features.interference.enabled','Interference fields'),
  R('features.interference.interferenceScale','Sampling scale',.5,12,.25,'',active('interference')),
  R('features.interference.frequency','Fringe frequency',1,50,1,'',active('interference')),
  R('features.interference.contrast','Fringe contrast',0,2,.05,'',active('interference')),
  R('features.interference.phaseSpeed','Phase speed',-5,5,.1,'',active('interference')),
  B('features.constellations.enabled','3D intersection constellations'),
  R('features.constellations.intersectionGlow','Star glow',0,3,.05,'',active('constellations')),
  R('features.constellations.sparkleSize','Star radius',.5,10,.1,'px',active('constellations')),
  R('features.constellations.persistence','Star lifetime',.1,8,.1,'s',active('constellations')),
  R('features.constellations.connectionBrightness','Connection glow',0,2,.05,'',active('constellations')),
  B('features.echoes.enabled','3D temporal echoes'),
  R('features.echoes.echoCount','Echo layers',1,6,1,'',active('echoes')),
  R('features.echoes.echoInterval','Capture interval',.05,1,.05,'s',active('echoes')),
  R('features.echoes.echoOpacity','Ghost opacity',0,1,.025,'',active('echoes')),
  R('features.echoes.depthSeparation','3D layer offset',0,.3,.005,'',active('echoes'))
 ]}
];
const PRESETS={
 'Glass Orbital':{geometry:{type:'prolate',aspect:.62},view:{orbit:true,orbitSpeed:5},particles:{max:64,splitAngle:60},colors:{mode:'dual'},features:{silk:{enabled:false},shell:{enabled:true,opacity:.55,meridians:14},haze:{enabled:false},spectral:{enabled:false},constellations:{enabled:false}}},
 'Photon Cocoon':{geometry:{aspect:.55},particles:{max:256,splitAngle:76},trails:{lifetime:24,width:.65},features:{silk:{enabled:true,silkOpacity:.6},haze:{enabled:true,density:.6},lineage:{enabled:true,generationHue:32}}},
 'Prismatic Core':{geometry:{aspect:.52},view:{tilt:30,orbitSpeed:9},lighting:{bloomStrength:1.7},features:{spectral:{enabled:true,dispersion:2.5,chromaticShift:6,spectralGlow:1},livingBoundary:{enabled:true,refraction:1.5},shockwaves:{enabled:true,intensity:2}}},
 'Cathedral Weave':{geometry:{type:'slender',aspect:.4},particles:{max:512,splitAngle:74},trails:{lifetime:28,width:.6,brightness:.75},features:{silk:{enabled:true,silkOpacity:.65},lineage:{enabled:true,generationHue:48},shell:{enabled:true,meridians:18,parallels:14,opacity:.16}}},
 'Nebula Capsule':{geometry:{type:'animated',aspect:.7},colors:{hue:275,hueSpread:230},view:{orbitSpeed:3},features:{haze:{enabled:true,density:1,brightness:.8},ribbons:{enabled:true,depth:.15},echoes:{enabled:true,echoOpacity:.4},shell:{enabled:true,opacity:.25}}},
 'Polar Resonance':{geometry:{type:'prolate',aspect:.4},particles:{max:128,emitter:'a',splitAngle:42},colors:{mode:'dual'},features:{shockwaves:{enabled:true,intensity:2,waveRadius:1.7},focusCores:{enabled:true,size:1.8,pulse:.6},silk:{enabled:false},constellations:{enabled:false}}},
 'Quantum Seed':{geometry:{aspect:.63},particles:{max:256,speed:.95,splitAngle:84,resetDelay:2},trails:{lifetime:16},features:{shockwaves:{enabled:true,intensity:2.1},constellations:{enabled:true,intersectionGlow:2.2},lineage:{enabled:true,generationHue:55},spectral:{enabled:false}}},
 'Twin Suns':{geometry:{type:'twin',aspect:.62},view:{orbit:true,orbitSpeed:5},particles:{max:128,splitAngle:69},colors:{mode:'dual'},features:{focusCores:{enabled:true,size:2,pulse:.7},echoes:{enabled:true,echoCount:5},silk:{enabled:true}}},
 'Aurora Lattice':{geometry:{aspect:.73},particles:{max:320,splitAngle:72},trails:{lifetime:22},colors:{hue:165,hueSpread:265,hueDrift:8},features:{ribbons:{enabled:true,ribbonWidth:4,depth:.18,edgeGlow:1.4},interference:{enabled:true,frequency:18},silk:{enabled:true}}},
 'Holographic Relic':{geometry:{aspect:.57},particles:{max:192},view:{tilt:23,orbitSpeed:4},colors:{hue:195,hueSpread:320},features:{shell:{enabled:true,opacity:.65,meridians:18,parallels:12},kaleidoscope:{enabled:true,symmetryCount:7,blendStrength:.55},interference:{enabled:true,contrast:1.5},echoes:{enabled:true,echoCount:6}}},
 // Original 2D favorites, adapted to the 3D spheroid; original 3D presets remain above.
 'Chromatic Weave':{geometry:{type:'prolate',aspect:.59},particles:{max:128,splitAngle:14},trails:{length:4.8,fadePower:1.2,width:.55,lifetime:22},features:{silk:{enabled:true},lineage:{enabled:true},ribbons:{enabled:false}}},
 'Focus Study':{geometry:{type:'prolate',aspect:.60},particles:{max:16,speed:.8,splitAngle:34},trails:{length:2.5,width:1.4},features:{axes:true,focusPulse:true,endpointFlashes:true,shell:{enabled:true,opacity:.6},silk:{enabled:false}}},
 'Radiant Halo':{geometry:{type:'sphere'},particles:{max:256,splitAngle:21},trails:{length:7,fadePower:1.2},colors:{mode:'bounce'},features:{spectral:{enabled:true,dispersion:1.7},shockwaves:{enabled:true}}},
 'Living Geometry':{geometry:{type:'animated',aspect:.5,pulse:.10,rotateSpeed:9},particles:{max:128,splitAngle:51},features:{livingBoundary:{enabled:true,surfaceRipple:.07,refraction:1},ribbons:{enabled:true}}},
 'Confocal Study':{geometry:{type:'confocal',aspect:.67},particles:{max:64,speed:1},trails:{length:3},features:{confocalGuides:true,guideCount:6,axes:true,endpointFlashes:true}},
 'Twin Resonance':{geometry:{type:'twin',aspect:.65},particles:{max:128},features:{focusCores:{enabled:true,size:1.5},echoes:{enabled:true,echoCount:3}}},
 'Prismatic Cathedral':{geometry:{type:'slender',aspect:.35},view:{yaw:42,orbitSpeed:4},particles:{max:256},features:{spectral:{enabled:true,dispersion:2.6,wavelengthSpread:2},ribbons:{enabled:true,depth:.2},silk:{enabled:true}}},
 'Kaleidoscopic Mandala':{geometry:{type:'prolate',aspect:.8},view:{yaw:0,tilt:0,orbit:false},particles:{max:128},features:{kaleidoscope:{enabled:true,symmetryCount:10,blendStrength:1,mirrorMode:'mirror'},silk:{enabled:true}}},
 'Quantum Interference':{geometry:{type:'prolate',aspect:.52},particles:{max:192},features:{interference:{enabled:true,frequency:28,interferenceScale:4,contrast:1.5},spectral:{enabled:true,dispersion:1.4}}},
 'Celestial Echoes':{geometry:{type:'prolate',aspect:.57},particles:{max:256},trails:{length:5.5,lifetime:28},features:{echoes:{enabled:true,echoCount:6,echoOpacity:.55},constellations:{enabled:true,intersectionGlow:2},haze:{enabled:true,density:.55}}}
};
const FEATURE_GROUPS=[
 ['Transparent Shell','features.shell.'],['Depth Haze','features.haze.'],['Focus Cores','features.focusCores.'],
 ['Chromatic Silk','features.silk.'],['Focal Shockwaves','features.shockwaves.'],['Spectral Dispersion','features.spectral.'],
 ['Volumetric Ribbons','features.ribbons.'],['Living Boundary','features.livingBoundary.'],['Kaleidoscope','features.kaleidoscope.'],
 ['Fractal Lineage','features.lineage.'],['Interference Fields','features.interference.'],['Intersection Constellations','features.constellations.'],['Temporal Echoes','features.echoes.']
];
  function deepCopy(obj) { return JSON.parse(JSON.stringify(obj)); }
  function merge(target, source) {
    if (!source || typeof source !== 'object' || Array.isArray(source)) return target;
    Object.keys(target).forEach(key => {
      if (!(key in source)) return;
      if (target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
        merge(target[key], source[key]);
      } else if (typeof target[key] === typeof source[key]) {
        target[key] = source[key];
      }
    });
    return target;
  }
  function get(obj, path) { return path.split('.').reduce((o, key) => o[key], obj); }
  function put(obj, path, value) {
    const bits = path.split('.');
    let at = obj;
    for (let i = 0; i < bits.length - 1; i++) at = at[bits[i]];
    at[bits[bits.length - 1]] = value;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }
  function labelValue(n, unit = '') {
    const display = typeof n === "number" ? (Number.isInteger(n) ? String(n) : String(Number(n.toFixed(3)))) : String(n);
    return display + (unit ? ' ' + unit : '');
  }
  const STYLES = `
    #cr-settings, #cr-settings *{box-sizing:border-box}
    #cr-settings{--panel:#0e1222;--line:#293047;--muted:#9da8c6;--text:#edf2ff;position:fixed;z-index:30;right:16px;top:16px;bottom:16px;width:min(355px,calc(100vw - 32px));background:rgba(14,18,34,.94);border:1px solid #34405c;border-radius:18px;color:var(--text);font:13px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;box-shadow:0 18px 70px #0008;backdrop-filter:blur(24px);display:flex;flex-direction:column;overflow:hidden;transition:transform .26s ease,opacity .26s ease}
    #cr-settings.cr-closed{transform:translateX(calc(100% + 30px));opacity:0;pointer-events:none}
    #cr-settings .cr-header{padding:17px 18px 13px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--line)}
    #cr-settings .cr-kicker{text-transform:uppercase;letter-spacing:3px;font-weight:700;font-size:10px;color:#81bbff}
    #cr-settings .cr-title{font-size:18px;font-weight:650;letter-spacing:.2px;margin-top:3px}
    #cr-settings button,#cr-settings select,#cr-settings input{font:inherit}
    #cr-settings button{cursor:pointer;color:inherit;background:#1a2439;border:1px solid #354059;border-radius:9px;padding:7px 10px}
    #cr-settings button:hover{background:#2a3b58}
    #cr-settings button:focus-visible,#cr-settings input:focus-visible,#cr-settings select:focus-visible{outline:2px solid #7cb6ff;outline-offset:2px}
    #cr-settings .cr-x{font-size:24px;line-height:1;padding:2px 10px 5px}
    #cr-settings .cr-tools{padding:12px 16px;display:flex;gap:8px;flex-wrap:wrap;border-bottom:1px solid var(--line)}
    #cr-settings .cr-tools button{flex:1;white-space:nowrap}
    #cr-settings .cr-preset{display:flex;align-items:center;gap:9px;width:100%}
    #cr-settings .cr-preset label{color:var(--muted);white-space:nowrap}
    #cr-settings select{width:100%;min-width:0;background:#171f32;color:var(--text);border:1px solid #37445f;border-radius:8px;padding:7px}
    #cr-settings .cr-search{padding:10px 16px;border-bottom:1px solid var(--line)}
    #cr-settings .cr-search input{width:100%;border:1px solid #34405a;border-radius:9px;background:#12192a;color:var(--text);padding:9px 11px}
    #cr-settings .cr-groups{overflow:auto;overscroll-behavior:contain;flex:1;padding:4px 11px 16px;scrollbar-width:thin;scrollbar-color:#495573 transparent}
    #cr-settings details{border-bottom:1px solid #273149;padding:3px 5px 5px}
    #cr-settings summary{cursor:pointer;padding:13px 4px 10px;font-weight:700;letter-spacing:.2px;list-style:none;display:flex;align-items:center;justify-content:space-between}
    #cr-settings summary::-webkit-details-marker{display:none}
    #cr-settings summary::after{content:'+';color:#9db6ed;font-size:18px;font-weight:400}
    #cr-settings details[open] summary::after{content:'−'}
    #cr-settings details.cr-feature-group{margin:6px 0 8px 6px;border:1px solid #34415d;border-radius:9px;background:#0d1524;overflow:hidden}
    #cr-settings details.cr-feature-group summary{padding:9px 11px;color:#b8d9ff;font-size:12px;font-weight:650}
    #cr-settings details.cr-feature-group[open]{padding-bottom:6px}
    #cr-settings details.cr-feature-group .cr-control,#cr-settings details.cr-feature-group .cr-check{margin:0 9px}
    #cr-settings .cr-control{padding:8px 3px 12px}
    #cr-settings .cr-control-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:7px;gap:10px}
    #cr-settings .cr-value{color:#94c9ff;font-variant-numeric:tabular-nums;font-size:12px}
    #cr-settings input[type=range]{width:100%;accent-color:#8cbaff;cursor:pointer}
    #cr-settings input[type=color]{width:100%;height:30px;padding:2px;border:1px solid #45516c;border-radius:8px;background:#171f32;cursor:pointer}
    #cr-settings input[type=checkbox]{width:18px;height:18px;accent-color:#83b6ff;cursor:pointer}
    #cr-settings .cr-check{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:7px 3px}
    #cr-settings .cr-foot{border-top:1px solid var(--line);padding:9px 15px;color:#9ea9c6;font-size:11px}
    #cr-settings .cr-empty{color:#a8b4cf;padding:18px 10px}
    #cr-backdrop{position:fixed;inset:0;background:#030613aa;z-index:29;display:none}
    @media(max-width:700px){#cr-settings{top:0;bottom:0;right:0;width:min(420px,92vw);border-radius:16px 0 0 16px;border-right:0}#cr-backdrop.cr-on{display:block}}
    @media(prefers-reduced-motion:reduce){#cr-settings{transition:none}}
  `;

  function create({ defaults, initial, onChange = () => {}, onToggle = () => {} }) {
    if (!document.getElementById('cr-editor-styles')) {
      const style = document.createElement('style');
      style.id = 'cr-editor-styles'; style.textContent = STYLES;
      document.head.appendChild(style);
    }
    let state = merge(deepCopy(defaults), initial || {});
    let open = false;
    const expanded = new Set(['Spheroid / Boundary', 'Particles / Physics', 'Camera / View', 'Features']);
    const expandedFeatures = new Set(['Transparent Shell','Chromatic Silk','Fractal Lineage']);
    const backdrop = document.createElement('div');
    backdrop.id = 'cr-backdrop';
    backdrop.addEventListener('click', () => setOpen(false));
    document.body.appendChild(backdrop);
    const root = document.createElement('aside');
    root.id = 'cr-settings'; root.className = 'cr-closed';
    root.setAttribute('aria-label', 'Chromatic Reflections settings');
    root.innerHTML = `
      <div class="cr-header"><div><div class="cr-kicker">Live controls</div><div class="cr-title">Chromatic Reflections 3D</div></div><button class="cr-x" type="button" aria-label="Close settings">×</button></div>
      <div class="cr-tools">
        <div class="cr-preset"><label for="cr-presets">Preset</label><select id="cr-presets"><option value="">Custom configuration</option>${Object.keys(PRESETS).map(n => `<option value="${escapeHtml(n)}">${escapeHtml(n)}</option>`).join('')}</select></div>
        <button type="button" data-command="export">Export JSON</button>
        <button type="button" data-command="import">Import JSON</button>
        <button type="button" data-command="reset">Reset</button>
        <input id="cr-import-file" type="file" accept=".json,application/json" hidden>
      </div>
      <div class="cr-search"><input id="cr-filter" type="search" placeholder="Search settings…" aria-label="Search settings"></div>
      <div class="cr-groups" id="cr-groups"></div>
      <div class="cr-foot">Each effect can be toggled independently. Space pause · R restart · E editor</div>`;
    document.body.appendChild(root);
    const groups = root.querySelector('#cr-groups');
    const search = root.querySelector('#cr-filter');
    const presets = root.querySelector('#cr-presets');
    const file = root.querySelector('#cr-import-file');

    root.querySelector('.cr-x').addEventListener('click', () => setOpen(false));
    search.addEventListener('input', render);
    presets.addEventListener('change', () => {
      if (!presets.value) return;
      state = merge(deepCopy(defaults), PRESETS[presets.value]);
      render(); onChange(deepCopy(state), 'preset');
    });
    root.querySelector('[data-command="reset"]').addEventListener('click', () => {
      state = deepCopy(defaults); presets.value = ''; search.value = '';
      render(); onChange(deepCopy(state), 'reset');
    });
    root.querySelector('[data-command="export"]').addEventListener('click', () => {
      const data = JSON.stringify(state, null, 2);
      const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
      const a = document.createElement('a'); a.href = url; a.download = 'chromatic-reflections-3d.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    root.querySelector('[data-command="import"]').addEventListener('click', () => file.click());
    file.addEventListener('change', async () => {
      if (!file.files[0]) return;
      try {
        const loaded = JSON.parse(await file.files[0].text());
        if (!loaded || typeof loaded !== 'object' || Array.isArray(loaded)) throw Error('Not an object');
        state = merge(deepCopy(defaults), loaded);
        presets.value = ''; render(); onChange(deepCopy(state), 'import');
      } catch (error) { alert('Cannot import settings: ' + error.message); }
      finally { file.value = ''; }
    });

    function setOpen(value) {
      open = Boolean(value); root.classList.toggle('cr-closed', !open);
      backdrop.classList.toggle('cr-on', open);
      root.setAttribute('aria-hidden', String(!open));
      if ('inert' in root) root.inert = !open;
      onToggle(open);
    }
    function featureHtml(matches, searching) {
      const simple = matches.filter(f => !FEATURE_GROUPS.some(([,prefix]) => f.path.startsWith(prefix)));
      const groupsHtml = FEATURE_GROUPS.map(([title,prefix]) => {
        const fields = matches.filter(f => f.path.startsWith(prefix));
        if (!fields.length) return '';
        const isOpen = searching || expandedFeatures.has(title);
        return `<details class="cr-feature-group" data-feature-group="${escapeHtml(title)}" ${isOpen?'open':''}>
          <summary>${escapeHtml(title)}</summary>${fields.map(fieldHtml).join('')}</details>`;
      }).join('');
      return simple.map(fieldHtml).join('') + groupsHtml;
    }
    function render() {
      const query = search.value.trim().toLowerCase();
      let any = false;
      groups.innerHTML = SCHEMA.map(section => {
        const matches = section.fields.filter(f => {
          if (f.when && !f.when(state)) return false;
          return !query || (f.label + ' ' + f.path + ' ' + section.title).toLowerCase().includes(query);
        });
        if (!matches.length) return '';
        any = true;
        const expandedNow = query || expanded.has(section.title);
        return `<details data-section="${escapeHtml(section.title)}" ${expandedNow ? 'open' : ''}>
          <summary>${escapeHtml(section.title)}</summary>
          ${section.title === 'Features' ? featureHtml(matches, Boolean(query)) : matches.map(fieldHtml).join('')}</details>`;
      }).join('') || '<div class="cr-empty">No settings match your search.</div>';
      groups.querySelectorAll('details[data-section]').forEach(d => d.addEventListener('toggle', () => {
        if (d.open) expanded.add(d.dataset.section);
        else expanded.delete(d.dataset.section);
      }));
      groups.querySelectorAll('details[data-feature-group]').forEach(d => d.addEventListener('toggle', () => {
        if (d.open) expandedFeatures.add(d.dataset.featureGroup);
        else expandedFeatures.delete(d.dataset.featureGroup);
      }));
      if (!any) return;
      groups.querySelectorAll('[data-path]').forEach(el => {
        el.addEventListener('input', () => {
          const field = SCHEMA.flatMap(s => s.fields).find(f => f.path === el.dataset.path);
          let value = el.type === 'checkbox' ? el.checked : el.type === 'range' ? Number(el.value) : el.value;
          put(state, el.dataset.path, value);
          if(el.dataset.path==='geometry.type' && value==='rotated' && state.geometry.rotation===0){
            // A rotated preset must visibly rotate on selection, even at the default settings.
            state.geometry.rotation=35;
          }
          const valueTag = el.closest('.cr-control')?.querySelector('.cr-value');
          if (valueTag) valueTag.textContent = labelValue(value, field.unit);
          presets.value = '';
          onChange(deepCopy(state), el.dataset.path);
          if (el.type === 'checkbox' || el.tagName === 'SELECT') {
            const savedTop = groups.scrollTop;
            render(); groups.scrollTop = savedTop;
          }
        });
      });
    }
    function fieldHtml(field) {
      const value = get(state, field.path);
      const p = escapeHtml(field.path), label = escapeHtml(field.label);
      if (field.type === 'checkbox')
        return `<div class="cr-check"><label for="cr-${p}">${label}</label><input type="checkbox" id="cr-${p}" data-path="${p}" ${value ? 'checked' : ''}></div>`;
      if (field.type === 'select')
        return `<div class="cr-control"><div class="cr-control-head"><label for="cr-${p}">${label}</label></div><select id="cr-${p}" data-path="${p}">${field.options.map(([v, n]) => `<option value="${escapeHtml(v)}" ${v === value ? 'selected' : ''}>${escapeHtml(n)}</option>`).join('')}</select></div>`;
      if (field.type === 'color')
        return `<div class="cr-control"><div class="cr-control-head"><label for="cr-${p}">${label}</label></div><input id="cr-${p}" type="color" data-path="${p}" value="${escapeHtml(value)}"></div>`;
      return `<div class="cr-control"><div class="cr-control-head"><label for="cr-${p}">${label}</label><output class="cr-value">${labelValue(value, field.unit)}</output></div><input id="cr-${p}" data-path="${p}" type="range" min="${field.min}" max="${field.max}" step="${field.step}" value="${value}"></div>`;
    }
    render();
    return {
      setOpen,
      toggle: () => setOpen(!open),
      isOpen: () => open,
      getState: () => deepCopy(state),
      sync(next) { state = merge(deepCopy(defaults), next); render(); },
    };
  }

  window.SettingsEditor = { create, merge, presets: PRESETS };
})();
