
"use strict";

export function mountEditor({
  config,
  onChange=()=>{}
}) {

  // ==========================================================
  // UTILITIES
  // ==========================================================

  const clone=value=>JSON.parse(JSON.stringify(value));
  const defaults=clone(config);

  const clamp=(v,min,max)=>
    Math.max(min,Math.min(max,v));

  const get=path=>path.split(".").reduce(
    (obj,key)=>obj[key],config
  );

  const set=(path,value)=>{
    const keys=path.split(".");
    const last=keys.pop();

    const parent=keys.reduce(
      (obj,key)=>obj[key],config
    );

    parent[last]=value;
  };

  const rgbToHex=color=>"#"+color.map(v=>
    Math.round(clamp(v,0,255))
      .toString(16)
      .padStart(2,"0")
  ).join("");

  const hexToRgb=hex=>[1,3,5].map(i=>
    parseInt(hex.slice(i,i+2),16)
  );

  const number=(path,label,min,max,step,help)=>({
    path,label,type:"number",min,max,step,help
  });

  const toggle=(path,label,help)=>({
    path,label,type:"boolean",help
  });

  const color=(path,label,help)=>({
    path,label,type:"color",help
  });

  // ==========================================================
  // SETTINGS SCHEMA
  // ==========================================================

  const sections=[
    {
      title:"Wave Sources",
      fields:[
        number("waves.sourceCount","Source count",
          0,16,1,
          "Number of independent wave emitters."),
        number("waves.wavelength","Wavelength",
          20,800,1,
          "Distance between successive wave peaks."),
        number("waves.speed","Wave speed",
          -4,4,0.05,
          "Controls the direction and speed of wave animation."),
        number("waves.movementSpeed","Source movement",
          -2,2,0.01,
          "Speed at which emitters move around the screen."),
        number("waves.spread","Source spread",
          0,1,0.01,
          "How far emitters travel from the center.")
      ]
    },
    {
      title:"Appearance",
      fields:[
        color("appearance.colorA","First color",
          "First color used in the interference palette."),
        color("appearance.colorB","Second color",
          "Second color used in the interference palette."),
        color("appearance.backgroundColor","Background",
          "Color used behind the rendered surface."),
        number("appearance.brightness","Brightness",
          0,3,0.01,
          "Overall brightness of the interference field."),
        number("appearance.contrast","Contrast",
          0.2,8,0.05,
          "Higher values create narrower bright bands."),
        number("appearance.bandFrequency","Band frequency",
          0.25,12,0.05,
          "Number of visible interference bands."),
        toggle("appearance.smoothing","Smooth scaling",
          "Use smooth texture scaling when rendering.")
      ]
    },
    {
      title:"View / 3D",
      fields:[
        toggle("view.threeD","Enable 3D",
          "Displace a mesh using the interference field."),
        toggle("view.perspective","Perspective",
          "Switch between perspective and orthographic projection."),
        number("view.tilt","Tilt",
          0,75,1,
          "Camera inclination relative to the surface."),
        number("view.rotation","Rotation",
          -180,180,1,
          "Camera orientation around the surface."),
        number("view.zoom","Zoom",
          0.5,3,0.01,
          "Magnification of the surface."),
        number("view.elevation","Elevation",
          0,250,1,
          "Vertical displacement of interference waves."),
        number("view.meshResolution","Mesh resolution",
          24,320,1,
          "Number of subdivisions along each mesh axis."),
        number("view.smoothness","Displacement strength",
          0,2,0.01,
          "Multiplier applied to surface displacement.")
      ]
    },
    {
      title:"Mouse",
      fields:[
        toggle("mouse.enabled","Enabled",
          "Allow the pointer to influence the wave field."),
        number("mouse.strength","Source strength",
          0,5,0.05,
          "Amplitude of the pointer-generated wave."),
        number("mouse.radius","Influence radius",
          20,1000,1,
          "Radius of the pointer's influence."),
        number("mouse.smoothing","Response speed",
          0.5,30,0.5,
          "How quickly the wave influence follows the pointer."),
        color("mouse.color","Mouse color",
          "Color blended into the pointer's influence area.")
      ]
    },
    {
      title:"Glow",
      fields:[
        toggle("glow.enabled","Legacy glow",
          "Enable the original-style soft glow contribution."),
        number("glow.intensity","Intensity",
          0,2,0.01,
          "Contribution of the original glow effect."),
        number("glow.blur","Blur radius",
          0,40,1,
          "Blur radius for the legacy glow.")
      ]
    },
    {
      title:"Rendering",
      fields:[
        number("rendering.resolution","Render scale",
          0.25,1,0.05,
          "1 is full resolution; lower values improve performance."),
        number("rendering.pixelRatio","Pixel ratio",
          0.5,2,0.1,
          "Multiplier applied to the device pixel ratio."),
        number("rendering.fpsLimit","FPS limit",
          15,144,1,
          "Maximum requested rendering frequency."),
        number("rendering.exposure","Exposure",
          0.1,3,0.05,
          "Final image exposure."),
        toggle("rendering.toneMapping","Tone mapping",
          "Apply cinematic tone mapping to bright colors.")
      ]
    },
    {
      title:"Features",
      fields:[]
    },
    {
      title:"Settings Pane",
      fields:[
        toggle("panel.enabled","Enable pane",
          "Disable the editor after copying your configuration.")
      ]
    }
  ];

  // ==========================================================
  // FEATURE SCHEMA
  // ==========================================================

  const features=[
    {
      key:"iridescence",
      title:"Spectral Iridescence",
      help:"Animated spectral colors with view-dependent shifts.",
      fields:[
        number("spectrumWidth","Spectrum width",
          0,3,0.01,"Spread of spectral colors."),
        number("dispersion","Dispersion",
          0,3,0.01,"Strength of angle-dependent color separation."),
        number("hueShift","Hue shift",
          -2,2,0.01,"Offset of the spectral palette."),
        number("saturation","Saturation",
          0,2,0.01,"Strength of spectral color saturation."),
        number("speed","Animation speed",
          -2,2,0.01,"Speed of spectral color movement.")
      ]
    },
    {
      key:"caustics",
      title:"Liquid Caustics",
      help:"Concentrated light patterns formed from wave gradients.",
      fields:[
        number("intensity","Intensity",
          0,3,0.01,"Brightness of concentrated light."),
        number("sharpness","Sharpness",
          0.1,12,0.1,"How narrow caustic highlights become."),
        number("scale","Scale",
          0.1,5,0.05,"Scale of the caustic structure."),
        number("distortion","Distortion",
          0,3,0.01,"Sensitivity to local wave gradients."),
        color("color","Light color",
          "Color of the caustic highlights.")
      ]
    },
    {
      key:"vortex",
      title:"Flowing Vortex Distortion",
      help:"Twists the interference field into animated currents.",
      fields:[
        number("count","Vortex count",
          0,8,1,"Number of active vortex centers."),
        number("radius","Radius",
          20,800,1,"Area affected by each vortex."),
        number("strength","Strength",
          -6,6,0.05,"Rotation applied to the wave field."),
        number("speed","Rotation speed",
          -3,3,0.01,"Movement speed of vortex centers."),
        number("turbulence","Turbulence",
          0,3,0.01,"Additional small-scale distortion.")
      ]
    },
    {
      key:"bloom",
      title:"Cinematic HDR Bloom",
      help:"GPU-based bright-pass extraction and Gaussian blur.",
      fields:[
        number("threshold","Threshold",
          0,3,0.01,"Minimum brightness that produces bloom."),
        number("intensity","Intensity",
          0,3,0.01,"Amount of blurred light added to the image."),
        number("radius","Radius",
          0,40,0.5,"Spread of the bloom effect."),
        number("softness","Softness",
          0.01,1,0.01,"Soft transition around the bloom threshold."),
        number("exposure","Bloom exposure",
          0.1,3,0.05,"Exposure multiplier when bloom is enabled.")
      ]
    },
    {
      key:"material",
      title:"Reflective Liquid Material",
      help:"Glossy surface shading with specular and Fresnel light.",
      fields:[
        number("roughness","Roughness",
          0,1,0.01,"Controls the width of specular highlights."),
        number("metallic","Metallic",
          0,1,0.01,"Changes the metallic appearance of reflections."),
        number("reflectivity","Reflectivity",
          0,3,0.01,"Brightness of reflected highlights."),
        number("fresnel","Fresnel strength",
          0,3,0.01,"Reflectivity near grazing viewing angles."),
        number("lightDirection","Light direction",
          -180,180,1,"Angle of the virtual directional light.")
      ]
    },
    {
      key:"ripples",
      title:"Interactive Ripple Shockwaves",
      help:"Pointer-generated expanding waves and dragging wakes.",
      fields:[
        number("amplitude","Amplitude",
          0,3,0.01,"Strength of each shockwave."),
        number("speed","Propagation speed",
          10,600,1,"Speed at which shockwaves expand."),
        number("damping","Damping",
          0.05,4,0.05,"How quickly shockwaves fade."),
        number("radius","Ripple radius",
          20,600,1,"Width of the expanding wave front."),
        number("maxCount","Maximum ripples",
          1,16,1,"Maximum simultaneously tracked shockwaves.")
      ]
    },
    {
      key:"filaments",
      title:"Interference Filaments",
      help:"Thin glowing contours that follow wave interference.",
      fields:[
        number("density","Density",
          0.5,15,0.1,"Number of contour lines."),
        number("thickness","Thickness",
          0.001,0.3,0.001,"Width of luminous filaments."),
        number("brightness","Brightness",
          0,5,0.05,"Intensity of filament highlights."),
        number("threshold","Contour threshold",
          0,1,0.01,"Selects the regions where contours appear."),
        number("flicker","Flicker",
          0,1,0.01,"Amount of animated filament flicker.")
      ]
    },
    {
      key:"atmosphere",
      title:"Volumetric Light",
      help:"Screen-space light scattering and atmospheric haze.",
      fields:[
        number("scattering","Scattering",
          0,3,0.01,"Strength of scattered light shafts."),
        number("density","Density",
          0,2,0.01,"Amount of atmospheric haze."),
        number("rayLength","Ray length",
          0,2,0.01,"Length of light sampling rays."),
        number("attenuation","Attenuation",
          0,1,0.01,"How quickly light fades along rays."),
        color("color","Atmosphere color",
          "Tint of scattered light and haze.")
      ]
    },
    {
      key:"harmonics",
      title:"Fractal Wave Harmonics",
      help:"Additional interference layers at different frequencies.",
      fields:[
        number("layers","Harmonic layers",
          1,6,1,"Number of secondary wave layers."),
        number("frequency","Frequency multiplier",
          1.01,5,0.01,"Frequency increase between layers."),
        number("amplitude","Amplitude decay",
          0,1,0.01,"Strength retained by successive layers."),
        number("phaseDrift","Phase drift",
          -3,3,0.01,"Animation speed of harmonic phases."),
        number("complexity","Complexity",
          0,2,0.01,"Additional structural variation.")
      ]
    }
  ];

  // ==========================================================
  // PRESETS
  // ==========================================================

  const presets={
    "Liquid Aurora":{
      appearance:{
        colorA:[15,220,190],
        colorB:[120,50,255],
        brightness:0.8,
        contrast:2.3,
        bandFrequency:2
      },
      view:{threeD:false},
      features:{
        iridescence:{
          enabled:true,spectrumWidth:0.9,
          dispersion:0.8,speed:0.1
        },
        caustics:{enabled:true,intensity:0.35},
        vortex:{enabled:true,strength:0.7},
        bloom:{enabled:true,intensity:0.8},
        material:{enabled:false},
        filaments:{enabled:false},
        atmosphere:{enabled:true,scattering:0.25},
        harmonics:{enabled:true,layers:3}
      }
    },
    "Holographic Ocean":{
      appearance:{
        colorA:[10,150,230],
        colorB:[180,90,255],
        brightness:0.9,
        contrast:2.1
      },
      view:{
        threeD:true,perspective:true,
        tilt:38,elevation:95,zoom:1.4
      },
      features:{
        iridescence:{enabled:true,dispersion:1.2},
        caustics:{enabled:true,intensity:0.8},
        vortex:{enabled:true,strength:0.35},
        bloom:{enabled:true,intensity:0.9},
        material:{
          enabled:true,roughness:0.18,
          metallic:0.5,reflectivity:1
        },
        atmosphere:{enabled:true,density:0.35},
        harmonics:{enabled:true,layers:3}
      }
    },
    "Molten Chrome":{
      appearance:{
        colorA:[90,110,160],
        colorB:[240,160,90],
        brightness:0.95,
        contrast:3
      },
      view:{
        threeD:true,tilt:48,
        elevation:130,zoom:1.5
      },
      features:{
        iridescence:{enabled:false},
        caustics:{enabled:true,intensity:0.5},
        vortex:{enabled:true,strength:0.65},
        bloom:{enabled:true,intensity:0.55},
        material:{
          enabled:true,metallic:1,
          roughness:0.08,reflectivity:1.5
        },
        filaments:{enabled:false},
        atmosphere:{enabled:false},
        harmonics:{enabled:true,layers:2}
      }
    },
    "Quantum Interference":{
      appearance:{
        colorA:[40,230,255],
        colorB:[200,40,255],
        brightness:1,
        contrast:3.5,
        bandFrequency:3.5
      },
      view:{threeD:false},
      features:{
        iridescence:{enabled:true,spectrumWidth:1.5},
        caustics:{enabled:true,intensity:0.5},
        vortex:{enabled:true,count:4,strength:1.4},
        bloom:{enabled:true,intensity:1.1},
        material:{enabled:false},
        filaments:{
          enabled:true,density:6,
          thickness:0.025,brightness:2
        },
        atmosphere:{enabled:false},
        harmonics:{
          enabled:true,layers:5,
          complexity:1.2
        }
      }
    },
    "Deep Plasma":{
      appearance:{
        colorA:[255,50,110],
        colorB:[90,20,230],
        brightness:1.1,
        contrast:2.7
      },
      view:{threeD:false},
      features:{
        iridescence:{enabled:true,spectrumWidth:0.6},
        caustics:{enabled:false},
        vortex:{
          enabled:true,count:5,
          strength:2.5,turbulence:0.8
        },
        bloom:{enabled:true,intensity:1.4},
        material:{enabled:false},
        filaments:{
          enabled:true,brightness:2.5
        },
        atmosphere:{
          enabled:true,scattering:0.5,
          density:0.5
        },
        harmonics:{enabled:true,layers:4}
      }
    }
  };

  // ==========================================================
  // CSS
  // ==========================================================

  const style=document.createElement("style");

  style.textContent=`
    .liquid-editor,
    .liquid-editor * {
      box-sizing:border-box;
    }

    .liquid-editor {
      font:12px system-ui,sans-serif;
      color:#e9edf5;
    }

    .liquid-editor [hidden] {
      display:none!important;
    }

    .liquid-launcher {
      position:fixed;
      top:16px;
      right:16px;
      z-index:1000;
    }

    .liquid-panel {
      position:fixed;
      top:0;
      right:0;
      bottom:0;
      width:min(380px,100vw);
      z-index:1001;
      display:flex;
      flex-direction:column;
      background:rgba(15,18,25,.97);
      border-left:1px solid #343c4a;
      box-shadow:-10px 0 40px #0009;
      transform:translateX(100%);
      transition:transform 220ms ease;
    }

    .liquid-panel.open {
      transform:translateX(0);
    }

    .liquid-header {
      display:flex;
      align-items:center;
      justify-content:space-between;
      padding:15px 16px;
      border-bottom:1px solid #343c4a;
      gap:12px;
    }

    .liquid-header strong {
      font-size:15px;
      font-weight:650;
    }

    .liquid-toolbar {
      padding:12px 16px;
      border-bottom:1px solid #343c4a;
      display:grid;
      gap:10px;
    }

    .liquid-body {
      flex:1;
      min-height:0;
      overflow-y:auto;
      padding:8px 16px 20px;
      scrollbar-width:thin;
    }

    .liquid-editor button,
    .liquid-editor select,
    .liquid-editor input,
    .liquid-editor textarea {
      font:inherit;
    }

    .liquid-editor button {
      padding:8px 10px;
      color:#e9edf5;
      background:#283140;
      border:1px solid #475367;
      border-radius:6px;
      cursor:pointer;
    }

    .liquid-editor button:hover {
      background:#39485d;
    }

    .liquid-editor input[type="search"],
    .liquid-editor select {
      width:100%;
      padding:9px;
      background:#0a0d13;
      color:#fff;
      border:1px solid #465064;
      border-radius:6px;
    }

    .liquid-editor input:focus-visible,
    .liquid-editor button:focus-visible,
    .liquid-editor select:focus-visible {
      outline:2px solid #80baff;
      outline-offset:2px;
    }

    .liquid-section {
      border:1px solid #343c4a;
      border-radius:8px;
      margin-top:12px;
      overflow:hidden;
    }

    .liquid-section>summary {
      cursor:pointer;
      padding:12px;
      background:#222936;
      font-weight:650;
      font-size:12px;
      user-select:none;
    }

    .liquid-section>summary:hover {
      background:#2d3747;
    }

    .liquid-section-content {
      padding:12px;
    }

    .liquid-feature {
      border:1px solid #374254;
      border-radius:7px;
      margin-bottom:10px;
      overflow:hidden;
    }

    .liquid-feature-header {
      display:flex;
      align-items:center;
      gap:8px;
      padding:10px;
      background:#1d2531;
    }

    .liquid-feature-header input {
      margin:0;
      accent-color:#80baff;
    }

    .liquid-feature-header button {
      flex:1;
      text-align:left;
      background:transparent;
      border:0;
      padding:2px;
      font-weight:600;
    }

    .liquid-feature-header button:hover {
      background:transparent;
      color:#80baff;
    }

    .liquid-feature-settings {
      padding:12px;
      border-top:1px solid #374254;
    }

    .liquid-control {
      position:relative;
      display:grid;
      grid-template-columns:minmax(0,1fr) 94px;
      gap:8px;
      align-items:center;
      padding:7px 0;
      border-bottom:1px solid #ffffff0b;
    }

    .liquid-control:last-child {
      border-bottom:0;
    }

    .liquid-control label {
      min-width:0;
      overflow-wrap:anywhere;
      color:#cdd7e7;
    }

    .liquid-control input[type="number"] {
      width:100%;
      min-width:0;
      padding:5px 6px;
      background:#0a0d13;
      color:#fff;
      border:1px solid #475367;
      border-radius:5px;
    }

    .liquid-control input[type="range"] {
      grid-column:1/-1;
      width:100%;
      margin:0;
      accent-color:#80baff;
    }

    .liquid-control input[type="checkbox"] {
      justify-self:end;
      accent-color:#80baff;
    }

    .liquid-color-controls {
      grid-column:1/-1;
      display:flex;
      align-items:center;
      gap:5px;
    }

    .liquid-color-controls input[type="color"] {
      width:43px;
      height:30px;
      padding:2px;
      border:1px solid #475367;
      border-radius:5px;
      background:transparent;
      flex-shrink:0;
    }

    .liquid-color-controls input[type="number"] {
      flex:1;
      width:0;
    }

    .liquid-actions {
      display:flex;
      flex-wrap:wrap;
      gap:8px;
      margin-top:16px;
    }

    .liquid-code {
      width:100%;
      height:280px;
      resize:vertical;
      padding:10px;
      margin-top:12px;
      color:#bce0ff;
      background:#090c12;
      border:1px solid #465064;
      border-radius:6px;
      font:11px/1.5 monospace!important;
      white-space:pre;
    }

    .liquid-status {
      min-height:18px;
      margin-top:8px;
      font-size:11px;
      color:#a8d6ad;
    }

    .liquid-hint {
      font-size:11px;
      color:#9eabc0;
      line-height:1.6;
    }

    .liquid-tooltip {
      position:fixed;
      z-index:1100;
      max-width:260px;
      padding:10px 12px;
      color:#eaf2ff;
      background:#202b3a;
      border:1px solid #53647b;
      border-radius:7px;
      box-shadow:0 8px 25px #0008;
      font-size:12px;
      line-height:1.5;
      pointer-events:none;
      display:none;
    }

    .liquid-empty {
      padding:20px 8px;
      text-align:center;
      color:#aab6c8;
    }

    @media(max-width:700px) {
      .liquid-tooltip {
        display:none!important;
      }
    }

    @media(prefers-reduced-motion:reduce) {
      .liquid-panel {
        transition:none;
      }
    }
  `;

  document.head.appendChild(style);

  // ==========================================================
  // ROOT ELEMENT
  // ==========================================================

  const root=document.createElement("div");
  root.className="liquid-editor";
  root.setAttribute("data-background-editor","");

  root.innerHTML=`
    <button class="liquid-launcher"
            type="button"
            aria-expanded="false">
      Settings
    </button>

    <aside class="liquid-panel"
           aria-label="Liquid Interference settings"
           inert>
      <div class="liquid-header">
        <strong>Liquid Interference</strong>
        <button class="liquid-close" type="button">
          Retract
        </button>
      </div>

      <div class="liquid-toolbar">
        <input class="liquid-search"
               type="search"
               placeholder="Search settings..."
               aria-label="Search settings">

        <select class="liquid-presets"
                aria-label="Select preset">
          <option value="">Select preset...</option>
        </select>

        <div style="display:flex;gap:8px">
          <button class="liquid-expand"
                  type="button"
                  style="flex:1">
            Expand all
          </button>
          <button class="liquid-collapse"
                  type="button"
                  style="flex:1">
            Collapse all
          </button>
        </div>
      </div>

      <div class="liquid-body">
        <div class="liquid-sections"></div>

        <p class="liquid-empty" hidden>
          No matching settings.
        </p>

        <div class="liquid-actions">
          <button class="liquid-show" type="button">
            Show code
          </button>
          <button class="liquid-copy" type="button">
            Copy config
          </button>
          <button class="liquid-reset" type="button">
            Reset
          </button>
        </div>

        <textarea class="liquid-code"
                  readonly
                  spellcheck="false"
                  hidden
                  aria-label="Configuration code"></textarea>

        <div class="liquid-status" role="status"></div>

        <p class="liquid-hint">
          Changes are applied immediately.
          Hover over a setting for its description.
          Copy the configuration into index.html
          to preserve your settings.
        </p>
      </div>
    </aside>

    <div class="liquid-tooltip" role="tooltip"></div>
  `;

  document.body.appendChild(root);

  const find=s=>root.querySelector(s);

  const panel=find(".liquid-panel");
  const launcher=find(".liquid-launcher");
  const close=find(".liquid-close");
  const search=find(".liquid-search");
  const presetSelect=find(".liquid-presets");
  const sectionsRoot=find(".liquid-sections");
  const tooltip=find(".liquid-tooltip");
  const code=find(".liquid-code");
  const status=find(".liquid-status");
  const empty=find(".liquid-empty");

  const controls=new Map();
  const featureElements=new Map();
  const sectionElements=[];

  // ==========================================================
  // TOOLTIP
  // ==========================================================

  function showTooltip(element,text) {
    if(!text)return;

    tooltip.textContent=text;
    tooltip.style.display="block";

    const rect=element.getBoundingClientRect();
    const tooltipWidth=tooltip.offsetWidth;
    const tooltipHeight=tooltip.offsetHeight;

    let left=rect.left-tooltipWidth-12;

    if(left<8) {
      left=rect.right+12;
    }

    left=clamp(
      left,8,window.innerWidth-tooltipWidth-8
    );

    const top=clamp(
      rect.top,
      8,
      window.innerHeight-tooltipHeight-8
    );

    tooltip.style.left=left+"px";
    tooltip.style.top=top+"px";
  }

  function hideTooltip() {
    tooltip.style.display="none";
  }

  function attachTooltip(element,description) {
    if(!description)return;

    element.addEventListener("mouseenter",()=>{
      showTooltip(element,description);
    });

    element.addEventListener("mouseleave",hideTooltip);
    element.addEventListener("focusout",hideTooltip);
  }

  // ==========================================================
  // CODE EXPORT
  // ==========================================================

  function getCode() {
    return "const config = "+
      JSON.stringify(config,null,2)+";";
  }

  function refreshCode() {
    code.value=getCode();
  }

  function notify(path) {
    onChange(path);
    refreshCode();
    status.textContent="";

    if(path==="panel.enabled") {
      root.hidden=!config.panel.enabled;
    }
  }

  // ==========================================================
  // CREATE INDIVIDUAL CONTROL
  // ==========================================================

  let nextId=0;

  function createControl(field,parent) {
    const row=document.createElement("div");
    row.className="liquid-control";
    row.dataset.path=field.path;
    row.dataset.search=(
      field.label+" "+
      field.path+" "+
      (field.help||"")
    ).toLowerCase();

    const label=document.createElement("label");
    const id="liquid-field-"+nextId++;

    label.textContent=field.label;
    label.htmlFor=id;
    row.appendChild(label);

    let refresh;

    if(field.type==="boolean") {
      const input=document.createElement("input");
      input.id=id;
      input.type="checkbox";

      input.addEventListener("change",()=>{
        set(field.path,input.checked);
        notify(field.path);
      });

      row.appendChild(input);

      refresh=()=>{
        input.checked=Boolean(get(field.path));
      };
    }

    else if(field.type==="color") {
      const wrapper=document.createElement("div");
      wrapper.className="liquid-color-controls";

      const picker=document.createElement("input");
      picker.id=id;
      picker.type="color";

      const rgbInputs=[];

      for(let i=0;i<3;i++) {
        const input=document.createElement("input");
        input.type="number";
        input.min=0;
        input.max=255;
        input.step=1;

        input.setAttribute(
          "aria-label",
          field.label+" "+["red","green","blue"][i]
        );

        input.addEventListener("input",()=>{
          const value=input.valueAsNumber;
          if(!Number.isFinite(value))return;

          const next=[...get(field.path)];
          next[i]=Math.round(clamp(value,0,255));

          set(field.path,next);
          picker.value=rgbToHex(next);
          notify(field.path);
        });

        input.addEventListener("change",refresh);
        rgbInputs.push(input);
      }

      picker.addEventListener("input",()=>{
        set(field.path,hexToRgb(picker.value));
        refresh();
        notify(field.path);
      });

      wrapper.append(picker,...rgbInputs);
      row.appendChild(wrapper);

      refresh=()=>{
        const value=get(field.path);
        picker.value=rgbToHex(value);

        rgbInputs.forEach((input,i)=>{
          input.value=value[i];
        });
      };
    }

    else {
      const numeric=document.createElement("input");
      const range=document.createElement("input");

      numeric.id=id;
      numeric.type="number";
      range.type="range";

      for(const input of [numeric,range]) {
        input.min=field.min;
        input.max=field.max;
        input.step=field.step;
      }

      function update(source) {
        const raw=source.valueAsNumber;
        if(!Number.isFinite(raw))return;

        let value=clamp(
          raw,field.min,field.max
        );

        if(field.step>=1) {
          value=Math.round(value/field.step)*
            field.step;
        } else {
          value=Number(value.toFixed(5));
        }

        set(field.path,value);
        refresh();
        notify(field.path);
      }

      numeric.addEventListener("input",()=>{
        update(numeric);
      });

      range.addEventListener("input",()=>{
        update(range);
      });

      numeric.addEventListener("change",refresh);

      range.setAttribute("aria-label",field.label);
      row.append(numeric,range);

      refresh=()=>{
        const value=get(field.path);
        numeric.value=value;
        range.value=value;
      };
    }

    controls.set(field.path,{row,refresh});
    refresh();
    attachTooltip(row,field.help);
    parent.appendChild(row);

    return row;
  }

  // ==========================================================
  // CREATE FEATURE
  // ==========================================================

  function createFeature(feature,parent) {
    const container=document.createElement("div");
    container.className="liquid-feature";
    container.dataset.feature=feature.key;

    const header=document.createElement("div");
    header.className="liquid-feature-header";

    const enabled=document.createElement("input");
    enabled.type="checkbox";
    enabled.setAttribute(
      "aria-label",
      "Enable "+feature.title
    );

    const expand=document.createElement("button");
    expand.type="button";
    expand.textContent=feature.title;

    const settings=document.createElement("div");
    settings.className="liquid-feature-settings";

    const prefix="features."+feature.key+".";

    const childRows=[];

    for(const field of feature.fields) {
      const complete={
        ...field,
        path:prefix+field.path
      };

      childRows.push(
        createControl(complete,settings)
      );
    }

    let expanded=false;

    function refreshFeature() {
      const active=Boolean(
        get(prefix+"enabled")
      );

      enabled.checked=active;

      settings.hidden=!active||!expanded;
      expand.setAttribute(
        "aria-expanded",
        String(active&&expanded)
      );
      expand.textContent=
        (expanded?"▾ ":"▸ ")+feature.title;
    }

    enabled.addEventListener("change",()=>{
      set(prefix+"enabled",enabled.checked);

      if(enabled.checked)expanded=true;

      refreshFeature();
      notify(prefix+"enabled");
    });

    expand.addEventListener("click",()=>{
      expanded=!expanded;
      refreshFeature();
    });

    header.append(enabled,expand);
    container.append(header,settings);
    parent.appendChild(container);

    attachTooltip(header,feature.help);

    featureElements.set(feature.key,{
      container,enabled,settings,
      childRows,
      refresh:refreshFeature,
      setExpanded(value) {
        expanded=value;
        refreshFeature();
      }
    });

    refreshFeature();
  }

  // ==========================================================
  // BUILD SECTIONS
  // ==========================================================

  for(const section of sections) {
    const details=document.createElement("details");
    details.className="liquid-section";
    details.open=section.title!=="Features";

    const summary=document.createElement("summary");
    summary.textContent=section.title;

    const content=document.createElement("div");
    content.className="liquid-section-content";

    if(section.title==="Features") {
      for(const feature of features) {
        createFeature(feature,content);
      }
    } else {
      for(const field of section.fields) {
        createControl(field,content);
      }
    }

    details.append(summary,content);
    sectionsRoot.appendChild(details);

    sectionElements.push({
      details,section,content
    });
  }

  // ==========================================================
  // SEARCH
  // ==========================================================

  function applySearch() {
    const query=search.value.trim().toLowerCase();
    let visibleCount=0;

    for(const item of sectionElements) {
      const {details,section}=item;

      const sectionMatch=
        section.title.toLowerCase().includes(query);

      let matches=0;

      if(section.title==="Features") {
        for(const feature of features) {
          const entry=featureElements.get(feature.key);

          const featureMatch=
            feature.title.toLowerCase().includes(query)||
            feature.help.toLowerCase().includes(query);

          let fieldMatches=0;

          feature.fields.forEach(field=>{
            const path="features."+
              feature.key+"."+field.path;

            const control=controls.get(path);

            const match=
              !query||
              sectionMatch||
              featureMatch||
              control.row.dataset.search.includes(query);

            control.row.hidden=!match;
            if(match)fieldMatches++;
          });

          const show=
            !query||
            sectionMatch||
            featureMatch||
            fieldMatches>0;

          entry.container.hidden=!show;

          if(show) {
            matches++;

            if(query) {
              entry.setExpanded(true);
            } else {
              entry.refresh();
            }
          }
        }
      } else {
        for(const field of section.fields) {
          const entry=controls.get(field.path);

          const match=
            !query||
            sectionMatch||
            entry.row.dataset.search.includes(query);

          entry.row.hidden=!match;
          if(match)matches++;
        }
      }

      details.hidden=matches===0;

      if(matches>0) {
        visibleCount++;
        if(query)details.open=true;
      }
    }

    empty.hidden=visibleCount>0;
    hideTooltip();
  }

  search.addEventListener("input",applySearch);

  // ==========================================================
  // PRESETS AND RESET
  // ==========================================================

  function merge(target,source) {
    for(const [key,value] of Object.entries(source)) {
      if(
        value!==null &&
        typeof value==="object" &&
        !Array.isArray(value)
      ) {
        if(
          target[key] &&
          typeof target[key]==="object" &&
          !Array.isArray(target[key])
        ) {
          merge(target[key],value);
        }
      } else {
        target[key]=clone(value);
      }
    }
  }

  function refreshAll() {
    for(const control of controls.values()) {
      control.refresh();
    }

    for(const feature of featureElements.values()) {
      feature.refresh();
    }

    refreshCode();
    applySearch();
  }

  function notifyAll() {
    // Rebuild wave sources and rendering resources
    // when applying a complete configuration.
    onChange("waves.sourceCount");
    onChange("view.meshResolution");
    onChange("rendering.resolution");
    onChange("rendering.pixelRatio");
    onChange("features.ripples.maxCount");
  }

  for(const name of Object.keys(presets)) {
    const option=document.createElement("option");
    option.value=name;
    option.textContent=name;
    presetSelect.appendChild(option);
  }

  presetSelect.addEventListener("change",()=>{
    const name=presetSelect.value;
    if(!name)return;

    merge(config,presets[name]);
    refreshAll();
    notifyAll();

    status.textContent="Preset applied: "+name;
  });

  find(".liquid-reset").addEventListener("click",()=>{
    merge(config,defaults);
    presetSelect.value="";
    refreshAll();
    notifyAll();
    status.textContent="Settings reset.";
  });

  // ==========================================================
  // EXPAND / COLLAPSE
  // ==========================================================

  find(".liquid-expand").addEventListener("click",()=>{
    sectionElements.forEach(s=>{
      s.details.open=true;
    });

    featureElements.forEach(f=>{
      f.setExpanded(true);
    });
  });

  find(".liquid-collapse").addEventListener("click",()=>{
    sectionElements.forEach(s=>{
      s.details.open=false;
    });

    featureElements.forEach(f=>{
      f.setExpanded(false);
    });
  });

  // ==========================================================
  // PANEL
  // ==========================================================

  function setOpen(open) {
    open=Boolean(open&&config.panel.enabled);

    panel.classList.toggle("open",open);
    panel.inert=!open;

    launcher.hidden=open||!config.panel.enabled;
    launcher.setAttribute(
      "aria-expanded",
      String(open)
    );

    if(!open)hideTooltip();

    if(open)close.focus();
    else if(config.panel.enabled)launcher.focus();
  }

  launcher.addEventListener("click",()=>{
    setOpen(true);
  });

  close.addEventListener("click",()=>{
    setOpen(false);
  });

  function onKeydown(event) {
    if(
      event.key==="Escape" &&
      panel.classList.contains("open")
    ) {
      setOpen(false);
    }
  }

  document.addEventListener("keydown",onKeydown);

  // ==========================================================
  // COPY CONFIGURATION
  // ==========================================================

  const show=find(".liquid-show");

  show.addEventListener("click",()=>{
    const visible=code.hidden;
    code.hidden=!visible;

    show.textContent=visible
      ?"Hide code":"Show code";

    refreshCode();
  });

  find(".liquid-copy").addEventListener(
    "click",async()=>{
      refreshCode();

      try {
        await navigator.clipboard.writeText(getCode());
        status.textContent="Configuration copied.";
      } catch {
        code.hidden=false;
        show.textContent="Hide code";
        code.focus();
        code.select();

        status.textContent=
          "Code selected. Press Ctrl+C to copy.";
      }
    }
  );

  // ==========================================================
  // INITIALIZE
  // ==========================================================

  refreshAll();
  root.hidden=!config.panel.enabled;

  return {
    refresh:refreshAll,
    destroy() {
      document.removeEventListener(
        "keydown",onKeydown
      );
      hideTooltip();
      root.remove();
      style.remove();
    }
  };
}
