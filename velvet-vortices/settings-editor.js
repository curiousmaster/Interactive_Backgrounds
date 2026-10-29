export function createSettingsEditor({
  config,
  defaults,
  onChange=()=>{},
  onReset=()=>{}
}) {
  const limits = {
    view: {
      tilt:[0,45,1],
      zoom:[0.6,2,0.05]
    },
    pile: {
      density:[0.3,3,0.05],
      length:[2,40,0.5],
      width:[0.2,2.5,0.05],
      curvature:[0,1.5,0.05],
      variation:[0,0.9,0.01]
    },
    flow: {
      vortexCount:[0,12,1],
      radius:[50,700,5],
      strength:[0,8,0.1],
      speed:[0,2,0.01],
      wandering:[0,0.5,0.01],
      direction:[-180,180,1]
    },
    lighting: {
      direction:[-180,180,1],
      strength:[0,3,0.05],
      sharpness:[1,16,0.5]
    },
    iridescence: {
      strength:[0,1,0.01],
      frequency:[0.25,6,0.05]
    },
    movingLights: {
      strength:[0,2,0.05],
      speed:[0,2,0.01]
    },
    folds: {
      height:[0,0.22,0.005],
      scale:[0.3,1.8,0.05],
      speed:[0,1,0.01]
    },
    shadows: {
      strength:[0,1,0.01]
    },
    turbulence: {
      strength:[0,2,0.05],
      scale:[0.2,3,0.05]
    },
    breathing: {
      strength:[0,0.7,0.01],
      speed:[0,3,0.05]
    },
    shimmer: {
      strength:[0,1,0.01],
      speed:[0,3,0.05],
      width:[0.03,0.8,0.01]
    },
    brush: {
      radius:[20,350,5],
      strength:[0,2,0.05],
      persistence:[0.2,15,0.1]
    },
    ripples: {
      strength:[0,2,0.05],
      speed:[20,350,5],
      lifetime:[1,12,0.25]
    },
    whirlpool: {
      radius:[30,450,5],
      strength:[0,8,0.1]
    },
    parallax: {
      strength:[0,0.4,0.01],
      smoothing:[0.5,15,0.5]
    },
    dust: {
      density:[0,1,0.01],
      brightness:[0,2,0.05],
      speed:[0,2,0.05]
    },
    bloom: {
      strength:[0,2,0.05],
      threshold:[0,2,0.05],
      radius:[0.5,6,0.25]
    },
    appearance: {
      exposure:[0.2,3,0.05]
    },
    quality: {
      pixelRatio:[0.5,2,0.25]
    },
    animation: {
      speed:[0,3,0.05]
    }
  };

  const names = {
    view:"View and camera",
    pile:"Curved velvet fibers",
    flow:"Vortex flow",
    lighting:"Anisotropic lighting",
    iridescence:"Iridescent sheen",
    movingLights:"Moving lights",
    folds:"Fabric folds",
    shadows:"Fiber and fold shading",
    turbulence:"Layered turbulence",
    breathing:"Breathing vortices",
    shimmer:"Shimmer waves",
    brush:"Pressure brushing",
    ripples:"Click ripples",
    whirlpool:"Interactive whirlpool",
    parallax:"Local pile depth",
    dust:"Floating dust",
    bloom:"Selective bloom",
    appearance:"Colors and exposure",
    quality:"Rendering quality",
    animation:"Animation",
    panel:"Settings editor"
  };

  const descriptions = {
    view:
      "3D enables displaced folds and raised fibers. Perspective " +
      "uses a vanishing point; orthographic keeps parallel lines parallel.",

    pile:
      "Instanced curved ribbon geometry. Length is no longer limited " +
      "by fiber spacing. Density is capped at approximately 90,000 " +
      "fibers for large views.",

    flow:
      "Smoothly wandering vortices orient the pile. Direction is the " +
      "base angle in degrees; radius is measured in fabric units.",

    lighting:
      "Tangent-based silky highlights with rounded fiber shading. " +
      "Sharpness narrows the highlight.",

    iridescence:
      "Color shifts follow fiber direction and viewing angle. " +
      "Frequency controls the number of color changes.",

    movingLights:
      "Two elevated moving lights illuminate fibers according to " +
      "their position, normal and tangent.",

    folds:
      "Animated fabric height and normals. Height affects geometry " +
      "in 3D and shading in both modes.",

    shadows:
      "Approximate fold occlusion and fiber-root shading. " +
      "Individual fibers do not cast shadow maps.",

    turbulence:
      "Three scales of smooth eddies enrich the vortex flow. " +
      "Higher scale produces smaller eddies.",

    breathing:
      "Vortex size and strength expand and contract at slightly " +
      "different phases.",

    shimmer:
      "Bands of light travel across the pile. Width controls how " +
      "broad the bright band appears.",

    brush:
      "Move across the fabric to comb and flatten fibers. " +
      "Continuous swept contact preserves tracks on every " +
      "affected fiber.",

    ripples:
      "Click or tap to bend and flatten fibers in expanding rings. " +
      "Up to sixteen recent ripples are retained.",

    whirlpool:
      "Hold the primary pointer button to twist the pile. The vortex " +
      "follows the pointer and releases gradually.",

    parallax:
      "Local pile compression in 3D. Strength controls extra " +
      "compression of brushed fibers; smoothing controls how quickly " +
      "the fibers respond. The camera stays fixed.",

    dust:
      "Particles float above the cloth in 3D, use depth testing, " +
      "and drift through bands of light.",

    bloom:
      "Bright-pass extraction followed by horizontal and vertical " +
      "Gaussian blur. Threshold selects bright areas; radius " +
      "controls spread.",

    appearance:
      "Two fabric colors, an underlying dark color, a highlight " +
      "color and tone-mapped exposure.",

    quality:
      "Maximum render resolution relative to CSS pixels. Lower " +
      "this first if the animation is slow.",

    animation:
      "Ambient time controls flow, folds, lights, particles and " +
      "ripples. Brushing remains interactive while paused.",

    panel:
      "Disabling the editor hides its Settings button. Copy your " +
      "settings first; reload to restore the editor."
  };

  const specific = {
    "view.threeD":
      "Enable raised fibers, displaced folds and camera tilt. " +
      "Disable for a flat surface.",

    "view.perspective":
      "Enable perspective projection; disable for orthographic " +
      "projection.",

    "view.tilt":
      "Camera tilt in degrees. Applies only in 3D.",

    "view.zoom":
      "Camera magnification. The generated cloth extends beyond " +
      "the viewport.",

    "pile.length":
      "Full fiber length in fabric units, with no spacing-based " +
      "truncation.",

    "pile.curvature":
      "Bend of individual ribbon fibers.",

    "pile.variation":
      "Amount of random fiber-length variation.",

    "brush.persistence":
      "Recovery half-life in seconds. Every brushed fiber keeps " +
      "its own memory.",

    "brush.pressure":
      "Faster pointer motion creates broader, stronger brushing.",

    "animation.respectReducedMotion":
      "Freeze ambient animation when your operating system " +
      "requests reduced motion.",

    "quality.pixelRatio":
      "Maximum pixel ratio. A value of 1 renders one pixel per " +
      "CSS pixel.",

    "bloom.threshold":
      "Brightness required to enter the bloom blur. HDR is used " +
      "when supported."
  };

  const title = s=>s
    .replace(/([A-Z])/g," $1")
    .replace(/^./,c=>c.toUpperCase());

  function labelFor(section,key) {
    return {
      "view.threeD":"3D surface",
      "view.perspective":"Perspective projection",
      "brush.pressure":"Speed-sensitive pressure",
      "quality.pixelRatio":"Maximum pixel ratio"
    }[section+"."+key]||title(key);
  }

  const style = document.createElement("style");

  style.textContent = `
    .ve {
      position:fixed;
      inset:0;
      z-index:10000;
      pointer-events:none;
      color:#eee7f7;
      color-scheme:dark;
      font:13px/1.5 system-ui;
    }
    .ve * {
      box-sizing:border-box;
    }
    .ve [hidden] {
      display:none!important;
    }
    .ve button,
    .ve input,
    .ve textarea {
      font:inherit;
    }
    .ve button {
      padding:8px 10px;
      border:1px solid #ffffff25;
      border-radius:7px;
      background:#30283e;
      color:inherit;
      cursor:pointer;
    }
    .ve button:hover {
      background:#463854;
    }
    .ve :focus-visible {
      outline:2px solid #cab1ed;
      outline-offset:3px;
    }
    .ve-toggle {
      position:absolute;
      top:16px;
      right:16px;
      pointer-events:auto;
    }
    .ve-panel {
      position:absolute;
      right:0;
      top:0;
      width:min(370px,100vw);
      height:100%;
      padding:20px;
      overflow:auto;
      background:#110d1bf5;
      backdrop-filter:blur(16px);
      border-left:1px solid #ffffff20;
      pointer-events:auto;
      transform:translateX(100%);
      transition:transform .2s;
    }
    .ve-panel.open {
      transform:translateX(0);
    }
    .ve-heading,
    .ve-row {
      display:flex;
      justify-content:space-between;
      align-items:center;
      gap:12px;
    }
    .ve h2 {
      font-size:18px;
      margin:0;
    }
    .ve p,
    .ve-status,
    .ve-count {
      color:#bcaecb;
      font-size:12px;
    }
    .ve-search {
      position:sticky;
      top:-20px;
      padding:12px 0;
      background:#15101f;
      z-index:2;
    }
    .ve-search input {
      width:100%;
      padding:10px;
      border:1px solid #ffffff30;
      border-radius:8px;
      background:#ffffff08;
      color:inherit;
    }
    .ve-actions {
      display:flex;
      flex-wrap:wrap;
      gap:7px;
      margin:12px 0;
    }
    .ve details {
      margin-bottom:10px;
      border:1px solid #ffffff18;
      border-radius:8px;
    }
    .ve summary {
      padding:12px;
      color:#d3bdea;
      font-weight:600;
      cursor:pointer;
    }
    .ve-body {
      padding:12px;
    }
    .ve-control {
      margin-bottom:14px;
    }
    .ve-control:last-child {
      margin-bottom:0;
    }
    .ve-row {
      margin-bottom:6px;
    }
    .ve label {
      cursor:help;
    }
    .ve input[type=range] {
      width:100%;
      accent-color:#bea2e0;
    }
    .ve input[type=checkbox] {
      width:18px;
      height:18px;
      accent-color:#bea2e0;
    }
    .ve input[type=number] {
      width:78px;
      padding:4px 6px;
      border:1px solid #ffffff25;
      border-radius:5px;
      background:#ffffff08;
      color:inherit;
    }
    .ve input[type=color] {
      width:60px;
      height:32px;
      border:1px solid #ffffff25;
      background:transparent;
      border-radius:5px;
    }
    .ve textarea {
      width:100%;
      min-height:280px;
      padding:12px;
      background:#0b0812;
      color:#dfd1ed;
      border:1px solid #ffffff25;
      border-radius:8px;
      font:11px/1.6 monospace;
      resize:vertical;
    }
    .ve-tip {
      position:fixed;
      z-index:10002;
      width:265px;
      max-width:calc(100vw - 24px);
      padding:12px;
      border:1px solid #bca0de55;
      border-radius:9px;
      background:#21182e;
      box-shadow:0 10px 35px #0007;
      pointer-events:none;
      font-size:12px;
    }
    @media(prefers-reduced-motion:reduce) {
      .ve-panel {
        transition:none;
      }
    }
  `;

  document.head.append(style);

  const root = document.createElement("div");

  root.className = "ve";
  root.dataset.backgroundEditor = "";

  root.innerHTML = `
    <button
      class="ve-toggle"
      aria-expanded="false"
      aria-controls="velvet-panel"
    >Settings</button>

    <aside
      id="velvet-panel"
      class="ve-panel"
      aria-label="Velvet settings"
      inert
    >
      <div class="ve-heading">
        <h2>Velvet Vortices</h2>
        <button class="ve-close">Retract</button>
      </div>

      <p>
        Move to brush. Click for ripples. Hold for a whirlpool.
        Hover over settings for help.
      </p>

      <div class="ve-search">
        <input
          type="search"
          aria-label="Search settings"
          placeholder="Search settings…"
        >
        <div class="ve-count" aria-live="polite"></div>
      </div>

      <div class="ve-actions">
        <button class="ve-expand">Expand all</button>
        <button class="ve-collapse">Collapse all</button>
      </div>

      <div class="ve-controls"></div>

      <p class="ve-empty" hidden>
        No matching settings.
      </p>

      <div class="ve-actions">
        <button class="ve-show">Show code</button>
        <button class="ve-copy">Copy settings</button>
        <button class="ve-weave">New weave</button>
        <button class="ve-reset">Reset defaults</button>
      </div>

      <textarea
        readonly
        spellcheck="false"
        aria-label="Configuration code"
        hidden
      ></textarea>

      <div class="ve-status" role="status"></div>
    </aside>

    <div
      id="velvet-tooltip"
      class="ve-tip"
      role="tooltip"
      hidden
    ></div>
  `;

  document.body.append(root);

  const $ = s=>root.querySelector(s);

  const panel = $(".ve-panel");
  const toggle = $(".ve-toggle");
  const search = $('input[type=search]');
  const code = $("textarea");
  const tip = $(".ve-tip");
  const status = $(".ve-status");

  const sections = [];
  const refreshers = [];

  let savedOpen = null;

  const exportCode = ()=>
    `const defaults = ${JSON.stringify(config,null,2)};`;

  function setOpen(open) {
    tip.hidden = true;
    toggle.hidden = false;

    if(
      !open&&
      panel.contains(document.activeElement)
    ) {
      toggle.focus();
    }

    panel.classList.toggle("open",open);
    panel.inert = !open;
    toggle.hidden = open;

    toggle.setAttribute(
      "aria-expanded",
      String(open)
    );

    if(open) search.focus();
  }

  function changed() {
    code.value = exportCode();
    onChange();

    if(!config.panel.enabled) {
      setOpen(false);
      root.hidden = true;
    }
  }

  function tooltip(row,text) {
    tip.textContent = text;
    tip.hidden = false;

    const r = row.getBoundingClientRect();
    const p = panel.getBoundingClientRect();
    const b = tip.getBoundingClientRect();

    tip.style.left = Math.max(
      12,
      Math.min(
        p.left-b.width-12,
        innerWidth-b.width-12
      )
    )+"px";

    tip.style.top = Math.max(
      12,
      Math.min(
        r.top,
        innerHeight-b.height-12
      )
    )+"px";
  }

  const hideTip = ()=>{
    tip.hidden = true;
  };

  function make(tag,parent,className) {
    const el = document.createElement(tag);

    if(className) {
      el.className = className;
    }

    if(parent) parent.append(el);

    return el;
  }

  for(
    const [section,group] of
    Object.entries(config)
  ) {
    const details = make(
      "details",
      $(".ve-controls")
    );

    const summary = make(
      "summary",
      details
    );

    const body = make(
      "div",
      details,
      "ve-body"
    );

    const rows = [];

    summary.textContent =
      names[section]||title(section);

    details.open =
      ["view","pile"].includes(section);

    for(
      const [key,value] of
      Object.entries(group)
    ) {
      const path = section+"."+key;
      const text = labelFor(section,key);

      const description =
        specific[path]||(
          (
            key==="enabled"
              ? "Enable or disable this effect. "
              : ""
          )+descriptions[section]
        );

      const row = make(
        "div",
        body,
        "ve-control"
      );

      const heading = make(
        "div",
        row,
        "ve-row"
      );

      const label = make(
        "label",
        heading
      );

      const id =
        "velvet-"+section+"-"+key;

      label.textContent = text;
      label.htmlFor = id;

      row.addEventListener(
        "pointerenter",
        ()=>tooltip(row,description)
      );

      row.addEventListener(
        "pointerleave",
        hideTip
      );

      row.addEventListener(
        "focusin",
        ()=>tooltip(row,description)
      );

      row.addEventListener(
        "focusout",
        hideTip
      );

      let refresh;

      if(typeof value==="boolean") {
        const input = make(
          "input",
          heading
        );

        input.type = "checkbox";
        input.id = id;
        input.checked = value;

        input.addEventListener(
          "change",
          ()=>{
            config[section][key] =
              input.checked;

            changed();
          }
        );

        refresh = ()=>{
          input.checked =
            config[section][key];
        };
      } else if(Array.isArray(value)) {
        const input = make(
          "input",
          heading
        );

        input.type = "color";
        input.id = id;

        refresh = ()=>{
          input.value = "#"+
            config[section][key]
              .map(v=>
                Math.round(v)
                  .toString(16)
                  .padStart(2,"0")
              )
              .join("");
        };

        refresh();

        input.addEventListener(
          "input",
          ()=>{
            config[section][key] =
              [1,3,5].map(i=>
                parseInt(
                  input.value.slice(i,i+2),
                  16
                )
              );

            changed();
          }
        );
      } else {
        const [min,max,step] =
          limits[section]?.[key]||
          [0,10,0.1];

        const number = make(
          "input",
          heading
        );

        const range = make(
          "input",
          row
        );

        number.type = "number";
        range.type = "range";
        number.id = id;

        range.setAttribute(
          "aria-label",
          text
        );

        refresh = ()=>{
          number.value =
            range.value =
              config[section][key];
        };

        for(
          const input of
          [number,range]
        ) {
          input.min = min;
          input.max = max;
          input.step = step;
          input.value = value;

          input.addEventListener(
            "input",
            ()=>{
              if(input.value==="") return;

              const raw =
                Number(input.value);

              if(
                !Number.isFinite(raw)
              ) {
                return;
              }

              const bounded = Math.max(
                min,
                Math.min(max,raw)
              );

              const normalized = Number(
                Math.max(
                  min,
                  Math.min(
                    max,
                    min+
                    Math.round(
                      (bounded-min)/step
                    )*step
                  )
                ).toFixed(6)
              );

              config[section][key] =
                normalized;

              if(input===range) {
                number.value = normalized;
              } else {
                range.value = normalized;
              }

              changed();
            }
          );

          input.addEventListener(
            "change",
            refresh
          );

          input.addEventListener(
            "blur",
            refresh
          );
        }
      }

      row.querySelectorAll("input")
        .forEach(input=>{
          input.setAttribute(
            "aria-describedby",
            "velvet-tooltip"
          );
        });

      refreshers.push(refresh);

      rows.push({
        row,
        text:[
          path,
          text,
          names[section],
          description
        ].join(" ").toLowerCase()
      });
    }

    sections.push({
      details,
      rows
    });
  }

  function filter() {
    hideTip();

    const query =
      search.value.trim().toLowerCase();

    const terms =
      query.split(/\s+/).filter(Boolean);

    if(query&&savedOpen===null) {
      savedOpen = sections.map(
        s=>s.details.open
      );
    }

    let total = 0;

    sections.forEach((s,i)=>{
      let n = 0;

      for(const r of s.rows) {
        const match = terms.every(
          t=>r.text.includes(t)
        );

        r.row.hidden = !match;

        if(match) n++;
      }

      s.details.hidden = n===0;

      if(query&&n) {
        s.details.open = true;
      } else if(
        !query&&
        savedOpen!==null
      ) {
        s.details.open =
          savedOpen[i];
      }

      total += n;
    });

    if(!query) {
      savedOpen = null;
    }

    $(".ve-empty").hidden =
      total>0;

    $(".ve-count").textContent = query
      ? total+" matching settings"
      : "Search names, sections, or descriptions.";
  }

  search.addEventListener(
    "input",
    filter
  );

  toggle.addEventListener(
    "click",
    ()=>setOpen(true)
  );

  $(".ve-close").addEventListener(
    "click",
    ()=>setOpen(false)
  );

  $(".ve-expand").addEventListener(
    "click",
    ()=>{
      sections.forEach(s=>{
        if(!s.details.hidden) {
          s.details.open = true;
        }
      });
    }
  );

  $(".ve-collapse").addEventListener(
    "click",
    ()=>{
      sections.forEach(s=>{
        if(!s.details.hidden) {
          s.details.open = false;
        }
      });
    }
  );

  $(".ve-show").addEventListener(
    "click",
    ()=>{
      code.hidden = !code.hidden;
      code.value = exportCode();

      $(".ve-show").textContent =
        code.hidden
          ? "Show code"
          : "Hide code";
    }
  );

  $(".ve-copy").addEventListener(
    "click",
    async()=>{
      code.value = exportCode();

      try {
        await navigator.clipboard.writeText(
          code.value
        );

        status.textContent =
          "Settings copied as const defaults.";
      } catch {
        code.hidden = false;

        $(".ve-show").textContent =
          "Hide code";

        code.focus();
        code.select();

        status.textContent =
          "Press Ctrl+C or ⌘C to copy.";
      }
    }
  );

  $(".ve-weave").addEventListener(
    "click",
    ()=>{
      onReset();

      status.textContent =
        "A new weave has been generated.";
    }
  );

  $(".ve-reset").addEventListener(
    "click",
    ()=>{
      for(
        const [s,g] of
        Object.entries(defaults)
      ) {
        for(
          const [k,v] of
          Object.entries(g)
        ) {
          config[s][k] =
            structuredClone(v);
        }
      }

      refreshers.forEach(f=>f());

      changed();
      onReset();
      filter();

      status.textContent =
        "Your preferred defaults have been restored.";
    }
  );

  function keydown(e) {
    if(
      e.key==="Escape"&&
      panel.classList.contains("open")
    ) {
      if(search.value) {
        search.value = "";
        filter();
        search.focus();
      } else {
        setOpen(false);
      }
    }
  }

  document.addEventListener(
    "keydown",
    keydown
  );

  panel.addEventListener(
    "scroll",
    hideTip
  );

  addEventListener(
    "resize",
    hideTip
  );

  code.value = exportCode();
  filter();

  return {
    destroy() {
      document.removeEventListener(
        "keydown",
        keydown
      );

      removeEventListener(
        "resize",
        hideTip
      );

      root.remove();
      style.remove();
    }
  };
}