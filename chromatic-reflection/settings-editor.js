/* Chromatic Reflections — dependency-free responsive settings editor. */
(() => {
  'use strict';

  const SCHEMA = [
    { title: 'Ellipse / Boundary', fields: [
      { path: 'geometry.type', label: 'Ellipse type', type: 'select', options: [
        ['ellipse', 'Standard ellipse'], ['rotated', 'Rotated ellipse'],
        ['eccentric', 'Eccentric ellipse'], ['animated', 'Animated ellipse'],
        ['confocal', 'Confocal ellipse'], ['twin', 'Twin ellipses'],
        ['circle', 'Circle'] ] },
      { path: 'geometry.aspect', label: 'Minor / major axis', min: 0.24, max: 0.98, step: 0.01,
        when: c => !['circle', 'eccentric'].includes(c.geometry.type) },
      { path: 'geometry.eccentricity', label: 'Eccentricity', min: 0.05, max: 0.96, step: 0.01,
        when: c => c.geometry.type === 'eccentric' },
      { path: 'geometry.size', label: 'Boundary size', min: 0.5, max: 1.15, step: 0.01 },
      { path: 'geometry.rotation', label: 'Rotation', min: -180, max: 180, step: 1, unit: '°',
        when: c => !['ellipse', 'circle'].includes(c.geometry.type) },
      { path: 'geometry.pulse', label: 'Breathing amplitude', min: 0, max: 0.2, step: 0.005,
        when: c => c.geometry.type === 'animated' },
      { path: 'geometry.rotateSpeed', label: 'Rotation speed', min: -35, max: 35, step: 0.5, unit: '°/s',
        when: c => c.geometry.type === 'animated' },
      { path: 'geometry.pulseSpeed', label: 'Breathing speed', min: 0.02, max: 2, step: 0.02, unit: 'Hz',
        when: c => c.geometry.type === 'animated' },
      { path: 'geometry.twinGap', label: 'Twin separation', min: 0, max: 0.25, step: 0.01,
        when: c => c.geometry.type === 'twin' },
      { path: 'geometry.showBoundary', label: 'Visible boundary', type: 'checkbox' },
      { path: 'geometry.boundaryWidth', label: 'Boundary thickness', min: 0.5, max: 4, step: 0.1, unit: 'px',
        when: c => c.geometry.showBoundary },
      { path: 'geometry.showFoci', label: 'Show focal points', type: 'checkbox' },
    ] },
    { title: 'Particles / Physics', fields: [
      { path: 'particles.count', label: 'Max balls before reset', min: 2, max: 600, step: 1 },
      { path: 'particles.speed', label: 'Travel speed', min: 0.1, max: 4, step: 0.05 },
      { path: 'particles.speedVariation', label: 'Speed variation', min: 0, max: 0.5, step: 0.01 },
      { path: 'particles.emitter', label: 'Starting focus', type: 'select', options: [
        ['a', 'Focus A'], ['b', 'Focus B'], ['alternate', 'Alternate between resets'] ] },
      { path: 'particles.distribution', label: 'Seed launch angles', type: 'select', options: [
        ['golden', 'Golden angle'], ['even', 'Evenly spaced'], ['fan', 'Angle fan'], ['random', 'Random'] ] },
      { path: 'particles.angle', label: 'Seed launch angle', min: -180, max: 180, step: 1, unit: '°' },
      { path: 'particles.spread', label: 'Seed angle spread', min: 0, max: 360, step: 1, unit: '°',
        when: c => c.particles.distribution === 'fan' },
      { path: 'particles.splitSpread', label: 'Split angle', min: 0, max: 90, step: 0.5, unit: '°' },
      { path: 'particles.resetDelay', label: 'Reset hold time', min: 0, max: 4, step: 0.05, unit: 's' },
      { path: 'particles.size', label: 'Ball radius', min: 0.6, max: 8, step: 0.1, unit: 'px' },
      { path: 'particles.showBodies', label: 'Draw balls', type: 'checkbox' },
    ] },
    { title: 'Trails', fields: [
      { path: 'trails.enabled', label: 'Enable light trails', type: 'checkbox' },
      { path: 'trails.lifetime', label: 'Trail lifetime', min: 0.4, max: 50, step: 0.2, unit: 's',
        when: c => c.trails.enabled },
      { path: 'trails.width', label: 'Line width', min: 0.3, max: 4, step: 0.1, unit: 'px',
        when: c => c.trails.enabled },
      { path: 'trails.brightness', label: 'Trail brightness', min: 0.05, max: 2.5, step: 0.05,
        when: c => c.trails.enabled },
      { path: 'trails.additive', label: 'Additive blending', type: 'checkbox', when: c => c.trails.enabled },
    ] },
    { title: 'Colors', fields: [
      { path: 'colors.mode', label: 'Color mapping', type: 'select', options: [
        ['rainbow', 'Launch angle / Rainbow'], ['bounce', 'Bounce index'],
        ['speed', 'Particle speed'], ['mono', 'Single color'], ['dual', 'Focus A / Focus B'] ] },
      { path: 'colors.hue', label: 'Base hue', min: 0, max: 360, step: 1, unit: '°' },
      { path: 'colors.hueSpread', label: 'Hue range', min: 0, max: 360, step: 1, unit: '°',
        when: c => c.colors.mode !== 'mono' && c.colors.mode !== 'dual' },
      { path: 'colors.saturation', label: 'Saturation', min: 0, max: 1, step: 0.01 },
      { path: 'colors.lightness', label: 'Lightness', min: 0.15, max: 0.9, step: 0.01 },
      { path: 'colors.hueDrift', label: 'Hue drift', min: -25, max: 25, step: 0.5, unit: '°/s',
        when: c => c.colors.mode !== 'dual' },
      { path: 'colors.focusA', label: 'Focus A color', type: 'color' },
      { path: 'colors.focusB', label: 'Focus B color', type: 'color' },
      { path: 'colors.boundary', label: 'Boundary color', type: 'color' },
    ] },
    { title: 'Lighting', fields: [
      { path: 'lighting.bloom', label: 'Bloom / light scattering', type: 'checkbox' },
      { path: 'lighting.bloomStrength', label: 'Bloom intensity', min: 0, max: 2.5, step: 0.05,
        when: c => c.lighting.bloom },
      { path: 'lighting.bloomRadius', label: 'Bloom radius', min: 0.4, max: 3, step: 0.1,
        when: c => c.lighting.bloom },
      { path: 'lighting.boundaryGlow', label: 'Glowing boundary', type: 'checkbox' },
      { path: 'lighting.focusGlow', label: 'Glowing foci', type: 'checkbox' },
    ] },
    { title: 'Scene / View', fields: [
      { path: 'scene.background', label: 'Background', type: 'color' },
      { path: 'scene.stars', label: 'Star field', min: 0, max: 1, step: 0.05 },
      { path: 'scene.vignette', label: 'Vignette', min: 0, max: 1, step: 0.05 },
      { path: 'view.zoom', label: 'Zoom', min: 0.6, max: 1.45, step: 0.01 },
      { path: 'view.tilt', label: 'Tilt (view from above)', min: 0, max: 70, step: 1, unit: '°' },
      { path: 'view.yaw', label: 'Yaw', min: -60, max: 60, step: 1, unit: '°' },
      { path: 'view.perspective', label: 'Perspective', type: 'checkbox' },
      { path: 'view.orbit', label: 'Auto orbit', type: 'checkbox' },
      { path: 'view.orbitSpeed', label: 'Orbit speed', min: -25, max: 25, step: 0.5, unit: '°/s',
        when: c => c.view.orbit },
    ] },
    { title: 'Interaction', fields: [
      { path: 'interaction.enabled', label: 'Pointer / touch enabled', type: 'checkbox' },
      { path: 'interaction.clickBurst', label: 'Tap to launch a burst', type: 'checkbox',
        when: c => c.interaction.enabled },
      { path: 'interaction.burstCount', label: 'Burst size', min: 1, max: 128, step: 1,
        when: c => c.interaction.enabled && c.interaction.clickBurst },
      { path: 'interaction.dragRotate', label: 'Drag to rotate boundary', type: 'checkbox',
        when: c => c.interaction.enabled },
      { path: 'interaction.showAim', label: 'Show pointer target', type: 'checkbox',
        when: c => c.interaction.enabled && c.interaction.clickBurst },
    ] },
    { title: 'Features', fields: [
      { path: 'features.confocalGuides', label: 'Confocal ellipse guides', type: 'checkbox' },
      { path: 'features.guideCount', label: 'Number of guides', min: 1, max: 8, step: 1,
        when: c => c.features.confocalGuides || c.geometry.type === 'confocal' },
      { path: 'features.axes', label: 'Major and minor axes', type: 'checkbox' },
      { path: 'features.focusPulse', label: 'Pulsating foci', type: 'checkbox' },
      { path: 'features.endpointFlashes', label: 'Reflection sparks', type: 'checkbox' },
      { path: 'features.directionMarkers', label: 'Show travel directions', type: 'checkbox' },
      { path: 'features.silk.enabled', label: 'Chromatic Silk', type: 'checkbox' },
      { path: 'features.silk.filamentWidth', label: 'Filament width', min: .15, max: 2, step: .05, unit: 'px', when: c=>c.features.silk.enabled },
      { path: 'features.silk.silkOpacity', label: 'Silk opacity', min: .05, max: 1, step: .025, when: c=>c.features.silk.enabled },
      { path: 'features.silk.iridescence', label: 'Iridescence', min: 0, max: 2, step: .05, when: c=>c.features.silk.enabled },
      { path: 'features.silk.strandGlow', label: 'Strand glow', min: 0, max: 2, step: .05, when: c=>c.features.silk.enabled },

      { path: 'features.shockwaves.enabled', label: 'Focal Shockwaves', type: 'checkbox' },
      { path: 'features.shockwaves.waveRadius', label: 'Wave radius', min: .05, max: 1.5, step: .05, when: c=>c.features.shockwaves.enabled },
      { path: 'features.shockwaves.waveSpeed', label: 'Wave speed', min: .1, max: 5, step: .05, when: c=>c.features.shockwaves.enabled },
      { path: 'features.shockwaves.intensity', label: 'Shockwave intensity', min: .05, max: 3, step: .05, when: c=>c.features.shockwaves.enabled },
      { path: 'features.shockwaves.decay', label: 'Wave decay', min: .1, max: 4, step: .1, when: c=>c.features.shockwaves.enabled },
      { path: 'features.shockwaves.distortion', label: 'Wave distortion', min: 0, max: 2, step: .05, when: c=>c.features.shockwaves.enabled },

      { path: 'features.spectral.enabled', label: 'Spectral Dispersion', type: 'checkbox' },
      { path: 'features.spectral.dispersion', label: 'Dispersion', min: 0, max: 3, step: .05, when: c=>c.features.spectral.enabled },
      { path: 'features.spectral.chromaticShift', label: 'Chromatic shift', min: 0, max: 8, step: .1, unit: 'px', when: c=>c.features.spectral.enabled },
      { path: 'features.spectral.spectralGlow', label: 'Spectral glow', min: 0, max: 2, step: .05, when: c=>c.features.spectral.enabled },
      { path: 'features.spectral.wavelengthSpread', label: 'Wavelength spread', min: .1, max: 3, step: .05, when: c=>c.features.spectral.enabled },

      { path: 'features.ribbons.enabled', label: 'Volumetric Ribbons', type: 'checkbox' },
      { path: 'features.ribbons.ribbonWidth', label: 'Ribbon width', min: .4, max: 6, step: .1, unit: 'px', when: c=>c.features.ribbons.enabled },
      { path: 'features.ribbons.twist', label: 'Ribbon twist', min: 0, max: 8, step: .1, when: c=>c.features.ribbons.enabled },
      { path: 'features.ribbons.depth', label: 'Ribbon depth', min: 0, max: 2, step: .05, when: c=>c.features.ribbons.enabled },
      { path: 'features.ribbons.edgeGlow', label: 'Edge glow', min: 0, max: 2, step: .05, when: c=>c.features.ribbons.enabled },
      { path: 'features.ribbons.perspective', label: 'Depth perspective', min: 0, max: 2, step: .05, when: c=>c.features.ribbons.enabled },

      { path: 'features.livingBoundary.enabled', label: 'Living Boundary', type: 'checkbox' },
      { path: 'features.livingBoundary.surfaceRipple', label: 'Surface ripple', min: 0, max: .1, step: .002, when: c=>c.features.livingBoundary.enabled },
      { path: 'features.livingBoundary.refraction', label: 'Refraction', min: 0, max: 2, step: .05, when: c=>c.features.livingBoundary.enabled },
      { path: 'features.livingBoundary.edgeThickness', label: 'Edge thickness', min: .5, max: 3, step: .05, when: c=>c.features.livingBoundary.enabled },
      { path: 'features.livingBoundary.impactGlow', label: 'Impact glow', min: 0, max: 3, step: .05, when: c=>c.features.livingBoundary.enabled },

      { path: 'features.kaleidoscope.enabled', label: 'Kaleidoscopic Symmetry', type: 'checkbox' },
      { path: 'features.kaleidoscope.symmetryCount', label: 'Symmetry sectors', min: 2, max: 18, step: 1, when: c=>c.features.kaleidoscope.enabled },
      { path: 'features.kaleidoscope.mirrorMode', label: 'Symmetry style', type: 'select', options: [['mirror','Mirror'],['repeat','Repeat']], when: c=>c.features.kaleidoscope.enabled },
      { path: 'features.kaleidoscope.rotationOffset', label: 'Sector rotation', min: -180, max: 180, step: 1, unit: '°', when: c=>c.features.kaleidoscope.enabled },
      { path: 'features.kaleidoscope.blendStrength', label: 'Mirroring blend', min: 0, max: 1, step: .05, when: c=>c.features.kaleidoscope.enabled },

      { path: 'features.lineage.enabled', label: 'Fractal Lineage', type: 'checkbox' },
      { path: 'features.lineage.generationHue', label: 'Hue per generation', min: -100, max: 100, step: 1, unit: '°', when: c=>c.features.lineage.enabled },
      { path: 'features.lineage.thicknessDecay', label: 'Thickness decay', min: .4, max: 1.2, step: .025, when: c=>c.features.lineage.enabled },
      { path: 'features.lineage.brightnessDecay', label: 'Brightness decay', min: .4, max: 1.2, step: .025, when: c=>c.features.lineage.enabled },
      { path: 'features.lineage.lineageGlow', label: 'Lineage glow', min: 0, max: 2, step: .05, when: c=>c.features.lineage.enabled },

      { path: 'features.interference.enabled', label: 'Interference Fields', type: 'checkbox' },
      { path: 'features.interference.interferenceScale', label: 'Sampling scale', min: .5, max: 12, step: .5, when: c=>c.features.interference.enabled },
      { path: 'features.interference.frequency', label: 'Fringe frequency', min: 1, max: 40, step: 1, when: c=>c.features.interference.enabled },
      { path: 'features.interference.contrast', label: 'Fringe contrast', min: 0, max: 2, step: .05, when: c=>c.features.interference.enabled },
      { path: 'features.interference.phaseSpeed', label: 'Phase speed', min: -5, max: 5, step: .1, when: c=>c.features.interference.enabled },

      { path: 'features.constellations.enabled', label: 'Intersection Constellations', type: 'checkbox' },
      { path: 'features.constellations.intersectionGlow', label: 'Intersection glow', min: 0, max: 3, step: .05, when: c=>c.features.constellations.enabled },
      { path: 'features.constellations.sparkleSize', label: 'Sparkle size', min: .5, max: 10, step: .1, unit: 'px', when: c=>c.features.constellations.enabled },
      { path: 'features.constellations.persistence', label: 'Sparkle persistence', min: .2, max: 10, step: .1, unit: 's', when: c=>c.features.constellations.enabled },
      { path: 'features.constellations.connectionBrightness', label: 'Connection brightness', min: 0, max: 2, step: .05, when: c=>c.features.constellations.enabled },

      { path: 'features.echoes.enabled', label: 'Temporal Echoes', type: 'checkbox' },
      { path: 'features.echoes.echoCount', label: 'Echo layers', min: 1, max: 6, step: 1, when: c=>c.features.echoes.enabled },
      { path: 'features.echoes.echoInterval', label: 'Capture interval', min: .05, max: 2, step: .05, unit: 's', when: c=>c.features.echoes.enabled },
      { path: 'features.echoes.echoOpacity', label: 'Echo opacity', min: 0, max: 1, step: .025, when: c=>c.features.echoes.enabled },
      { path: 'features.echoes.depthSeparation', label: 'Layer depth shift', min: 0, max: .1, step: .002, when: c=>c.features.echoes.enabled },
    ] },
  ];

  const PRESETS = {
    'Chromatic Weave': {
      geometry: {type:'ellipse',aspect:.59},
      particles: {count:128,speed:1.25,splitSpread:10,resetDelay:1},
      trails: {lifetime:15,width:.72,brightness:.8},
      colors: {mode:'rainbow',hue:215,hueSpread:330},
      features: {silk:{enabled:true,silkOpacity:.55},lineage:{enabled:true,generationHue:29},
        shockwaves:{enabled:true},spectral:{enabled:true},ribbons:{enabled:false},
        kaleidoscope:{enabled:false},interference:{enabled:false},constellations:{enabled:true},echoes:{enabled:false}}
    },
    'Focus Study': {
      geometry:{type:'ellipse',aspect:.58,showFoci:true},
      particles:{count:32,speed:.85,emitter:'a',size:4.2,splitSpread:18,resetDelay:1.3},
      trails:{lifetime:25,width:1.35,brightness:.8},colors:{mode:'dual'},
      features:{axes:true,shockwaves:{enabled:true,waveRadius:.9,distortion:1.25},
        silk:{enabled:false},spectral:{enabled:false},constellations:{enabled:false},echoes:{enabled:false}}
    },
    'Radiant Halo': {
      geometry:{type:'circle'},particles:{count:320,speed:1.9,splitSpread:8,resetDelay:.8},
      trails:{lifetime:17,brightness:.58,width:.65},colors:{mode:'bounce',hueSpread:360},
      lighting:{bloomStrength:1.2},
      features:{silk:{enabled:true},spectral:{enabled:true,dispersion:2.7},
        lineage:{enabled:true,generationHue:38},shockwaves:{enabled:true},constellations:{enabled:true}}
    },
    'Living Geometry': {
      geometry:{type:'animated',aspect:.48,pulse:.085,rotateSpeed:8},
      particles:{count:200,speed:1.4,splitSpread:12},
      trails:{lifetime:7,width:.85},
      features:{livingBoundary:{enabled:true,surfaceRipple:.035,refraction:1.3,impactGlow:1.6},
        ribbons:{enabled:true,depth:.8,ribbonWidth:2.4},silk:{enabled:true},echoes:{enabled:false}}
    },
    'Confocal Study': {
      geometry:{type:'confocal',aspect:.7},
      particles:{count:72,speed:.9,emitter:'a',splitSpread:14,resetDelay:1.1},
      trails:{lifetime:18,width:.75},
      features:{confocalGuides:true,guideCount:5,axes:true,
        interference:{enabled:true,frequency:17,contrast:.9},constellations:{enabled:true,intersectionGlow:1.8},
        shockwaves:{enabled:true},silk:{enabled:false},spectral:{enabled:false}}
    },
    'Twin Resonance': {
      geometry:{type:'twin',aspect:.67},
      particles:{count:180,speed:1.3,splitSpread:10,resetDelay:.8},
      trails:{lifetime:12,width:.75},
      features:{focusPulse:true,shockwaves:{enabled:true},
        echoes:{enabled:true,echoCount:4,echoOpacity:.28,depthSeparation:.014},silk:{enabled:true},
        constellations:{enabled:true}}
    },
    'Prismatic Cathedral': {
      geometry:{type:'rotated',aspect:.45,rotation:34},
      view:{perspective:true,tilt:24,yaw:-10},
      particles:{count:256,speed:1.7,splitSpread:17,resetDelay:1.2},
      trails:{lifetime:16,width:.85,brightness:.9},
      lighting:{bloomStrength:1.15},colors:{hue:260,hueSpread:340},
      features:{ribbons:{enabled:true,ribbonWidth:3.2,twist:2.4,depth:.9,edgeGlow:1.2},
        spectral:{enabled:true,dispersion:2.5,chromaticShift:4.6,spectralGlow:.7},
        silk:{enabled:false},echoes:{enabled:false},constellations:{enabled:true}}
    },
    'Kaleidoscopic Mandala': {
      geometry:{type:'circle'},
      particles:{count:256,speed:1.15,splitSpread:12,resetDelay:1.3},
      trails:{lifetime:16,brightness:.75},
      colors:{hue:280,hueSpread:280},
      features:{kaleidoscope:{enabled:true,symmetryCount:10,mirrorMode:'mirror',blendStrength:1},
        silk:{enabled:true,silkOpacity:.5},lineage:{enabled:true,generationHue:47},
        spectral:{enabled:true},constellations:{enabled:false},echoes:{enabled:false}}
    },
    'Quantum Interference': {
      geometry:{type:'eccentric',eccentricity:.87},
      particles:{count:256,speed:1.3,splitSpread:7},
      trails:{lifetime:21,width:.5,brightness:1.05},
      colors:{hue:200,hueSpread:170},
      features:{interference:{enabled:true,interferenceScale:8,frequency:30,contrast:1.4,phaseSpeed:2.2},
        silk:{enabled:true,filamentWidth:.25,iridescence:1.2},
        spectral:{enabled:true,dispersion:1.2},ribbons:{enabled:false},echoes:{enabled:false}}
    },
    'Celestial Echoes': {
      geometry:{type:'rotated',aspect:.62,rotation:-20},
      view:{perspective:true,tilt:17},
      particles:{count:128,speed:1.05,splitSpread:22,resetDelay:1.7},
      trails:{lifetime:26,width:.72,brightness:.7},
      colors:{hue:195,hueSpread:350},
      features:{echoes:{enabled:true,echoCount:6,echoInterval:.23,echoOpacity:.52,depthSeparation:.022},
        constellations:{enabled:true,intersectionGlow:2.2,sparkleSize:5,persistence:4.8,connectionBrightness:1.3},
        silk:{enabled:true,silkOpacity:.4},shockwaves:{enabled:true,distortion:.2},
        kaleidoscope:{enabled:false}}
    }
  };
  const FEATURE_GROUPS = [
    ['Chromatic Silk','features.silk.'],
    ['Focal Shockwaves','features.shockwaves.'],
    ['Spectral Dispersion','features.spectral.'],
    ['Volumetric Ribbons','features.ribbons.'],
    ['Living Boundary','features.livingBoundary.'],
    ['Kaleidoscopic Symmetry','features.kaleidoscope.'],
    ['Fractal Lineage','features.lineage.'],
    ['Interference Fields','features.interference.'],
    ['Intersection Constellations','features.constellations.'],
    ['Temporal Echoes','features.echoes.']
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
    const display = Number.isInteger(n) ? String(n) : String(Number(n.toFixed(3)));
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
    const expanded = new Set(['Ellipse / Boundary', 'Particles / Physics', 'Features']);
    const expandedFeatures = new Set(['Chromatic Silk','Fractal Lineage']);
    const backdrop = document.createElement('div');
    backdrop.id = 'cr-backdrop';
    backdrop.addEventListener('click', () => setOpen(false));
    document.body.appendChild(backdrop);
    const root = document.createElement('aside');
    root.id = 'cr-settings'; root.className = 'cr-closed';
    root.setAttribute('aria-label', 'Chromatic Reflections settings');
    root.innerHTML = `
      <div class="cr-header"><div><div class="cr-kicker">Live controls</div><div class="cr-title">Chromatic Reflections</div></div><button class="cr-x" type="button" aria-label="Close settings">×</button></div>
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
      const a = document.createElement('a'); a.href = url; a.download = 'chromatic-reflections.json';
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
