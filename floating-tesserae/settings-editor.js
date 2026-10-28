
export function createSettingsEditor({
  config,
  defaults = {},
  presets = {},
  onChange = () => {},
  onReset = () => {},
  onPreset = () => {}
}) {

  // ============================================================
  // CONTROL DEFINITIONS
  // ============================================================

  const limits = {
    "tiles.size": [10, 100, 1],
    "tiles.spacing": [0, 40, 1],
    "tiles.sizeVariation": [0, 0.8, 0.01],
    "tiles.thickness": [0.1, 30, 0.1],
    "tiles.bevel": [0, 0.5, 0.01],
    "tiles.morph": [0, 1, 0.01],
    "tiles.opacity": [0, 1, 0.01],
    "tiles.edgeOpacity": [0, 1, 0.01],
    "tiles.edgeWidth": [0.005, 0.2, 0.005],
    "tiles.heroChance": [0, 0.3, 0.005],
    "tiles.heroScale": [1, 3, 0.05],
    "tiles.personality": [0, 1, 0.01],

    "camera.tiltX": [-60, 60, 1],
    "camera.tiltY": [-60, 60, 1],
    "camera.perspective": [300, 2000, 10],
    "camera.zoom": [0.5, 4, 0.01],
    "camera.minZoom": [0.5, 2, 0.01],
    "camera.maxZoom": [1, 5, 0.01],
    "camera.parallax": [0, 100, 1],
    "camera.depth": [0, 200, 1],
    "camera.orbitSpeed": [0, 1, 0.01],

    "materials.metallic": [0, 1, 0.01],
    "materials.roughness": [0, 1, 0.01],
    "materials.glass": [0, 1, 0.01],
    "materials.iridescence": [0, 1, 0.01],
    "materials.fresnel": [0, 2, 0.01],
    "materials.backContrast": [0, 1, 0.01],
    "materials.environment": [0, 2, 0.01],

    "lighting.directionX": [-1, 1, 0.01],
    "lighting.directionY": [-1, 1, 0.01],
    "lighting.directionZ": [-1, 1, 0.01],
    "lighting.intensity": [0, 4, 0.01],
    "lighting.ambient": [0, 2, 0.01],
    "lighting.specular": [0, 4, 0.01],
    "lighting.glintStrength": [0, 3, 0.01],

    "motion.drift": [0, 150, 1],
    "motion.speed": [0, 3, 0.01],
    "motion.assemblySpeed": [0.1, 15, 0.1],
    "motion.separation": [0, 1, 0.01],
    "motion.cycleDuration": [2, 90, 1],
    "motion.rotation": [0, 180, 1],
    "motion.breathing": [0, 2, 0.01],
    "motion.explodeStrength": [0, 400, 1],
    "motion.dominoSpeed": [0, 10, 0.1],

    "physics.radius": [20, 600, 1],
    "physics.displacement": [0, 350, 1],
    "physics.rotation": [0, 180, 1],
    "physics.stiffness": [1, 100, 1],
    "physics.damping": [0.1, 30, 0.1],
    "physics.waveSpeed": [20, 1000, 10],
    "physics.shockStrength": [0, 300, 1],
    "physics.gravityStrength": [0, 300, 1],

    "colors.scale": [50, 1500, 10],
    "colors.speed": [0, 2, 0.01],
    "colors.flowStrength": [0, 2, 0.01],
    "colors.heightInfluence": [0, 2, 0.01],

    "atmosphere.haze": [0, 1, 0.01],
    "atmosphere.dustCount": [0, 1000, 10],
    "atmosphere.dustOpacity": [0, 1, 0.01],
    "atmosphere.bloomStrength": [0, 3, 0.01],
    "atmosphere.bloomThreshold": [0, 2, 0.01],
    "atmosphere.dofStrength": [0, 1, 0.01],
    "atmosphere.vignette": [0, 1, 0.01],
    "atmosphere.grain": [0, 0.3, 0.005],
    "atmosphere.aberration": [0, 0.02, 0.0005],
    "atmosphere.trailPersistence": [0, 0.99, 0.01],

    "effects.fractureIntensity": [0, 2, 0.01],
    "effects.connectionDistance": [0.5, 5, 0.1],
    "effects.portalRadius": [20, 500, 1],
    "effects.portalStrength": [0, 3, 0.01],
    "effects.scanSpeed": [0, 2, 0.01],

    "animation.speed": [0, 3, 0.05],
    "animation.maxDpr": [0.5, 3, 0.05],
    "animation.maxFps": [15, 144, 1]
  };

  // ============================================================
  // SELECT OPTIONS
  // ============================================================

  const selectOptions = {
    "tiles.shape": [
      ["square", "Square"],
      ["hexagon", "Hexagon"],
      ["triangle", "Triangle"]
    ],

    "camera.mode": [
      ["perspective", "Perspective"],
      ["orthographic", "Orthographic"]
    ],

    "materials.type": [
      ["iridescent", "Iridescent Glass"],
      ["metal", "Metal"],
      ["glass", "Glass"],
      ["ceramic", "Ceramic"],
      ["satin", "Satin"]
    ],

    "motion.mode": [
      ["wave", "Wave Assembly"],
      ["magnetic", "Magnetic Assembly"],
      ["vortex", "Vortex"],
      ["explosion", "Explosive Disintegration"],
      ["breathing", "Breathing Mosaic"],
      ["domino", "Domino Cascade"],
      ["classic", "Classic Drift"]
    ],

    "animation.quality": [
      ["auto", "Automatic"],
      ["low", "Low"],
      ["medium", "Medium"],
      ["high", "High"],
      ["ultra", "Ultra"]
    ]
  };

  // ============================================================
  // SETTING DESCRIPTIONS
  // ============================================================

  const descriptions = {
    "tiles.size":
      "Base width and height of each mosaic tile.",

    "tiles.spacing":
      "Distance between neighboring tiles.",

    "tiles.sizeVariation":
      "Random variation in individual tile dimensions.",

    "tiles.thickness":
      "Depth of the three-dimensional tiles.",

    "tiles.bevel":
      "Intended bevel amount for tile edges. The current renderer uses cube geometry and does not yet implement actual beveling.",

    "tiles.shape":
      "Selects the intended tile shape. The current renderer uses vertex deformation rather than complete geometric remeshing.",

    "tiles.morph":
      "Controls the amount of shape deformation.",

    "tiles.opacity":
      "Overall transparency of tile surfaces.",

    "tiles.edgeOpacity":
      "Strength of illuminated tile borders.",

    "tiles.edgeWidth":
      "Width of the edge-highlight region.",

    "tiles.heroChance":
      "Probability that a tile becomes a larger hero tile.",

    "tiles.heroScale":
      "Size multiplier for hero tiles.",

    "tiles.personality":
      "Controls variation in individual tile movement and color.",

    "camera.mode":
      "Choose perspective or orthographic projection.",

    "camera.tiltX":
      "Vertical camera tilt in degrees.",

    "camera.tiltY":
      "Horizontal camera rotation in degrees.",

    "camera.perspective":
      "Reference camera distance and perspective strength.",

    "camera.zoom":
      "Current camera zoom level.",

    "camera.minZoom":
      "Minimum zoom level allowed.",

    "camera.maxZoom":
      "Maximum zoom level allowed.",

    "camera.wheelZoom":
      "Allow the mouse wheel to control camera zoom.",

    "camera.parallax":
      "Camera movement in response to the mouse position.",

    "camera.depth":
      "Maximum depth variation in tile animation.",

    "camera.autoOrbit":
      "Automatically rotate the camera around the mosaic.",

    "camera.orbitSpeed":
      "Speed of automatic camera orbiting.",

    "materials.type":
      "Material selection. The current renderer uses a shared lighting model for all material types.",

    "materials.metallic":
      "Strength of metallic-looking reflections.",

    "materials.roughness":
      "Controls the sharpness of specular reflections.",

    "materials.glass":
      "Strength of glass-like Fresnel highlights.",

    "materials.iridescence":
      "Color shifting based on the viewing angle.",

    "materials.fresnel":
      "Intensity of grazing-angle reflections.",

    "materials.backContrast":
      "Intended contrast between front and reverse surfaces.",

    "materials.environment":
      "Strength of simulated environmental reflections.",

    "lighting.directionX":
      "Horizontal direction of the main light.",

    "lighting.directionY":
      "Vertical direction of the main light.",

    "lighting.directionZ":
      "Depth direction of the main light.",

    "lighting.intensity":
      "Brightness of directional lighting.",

    "lighting.ambient":
      "Amount of uniform ambient illumination.",

    "lighting.specular":
      "Strength of shiny surface highlights.",

    "lighting.glints":
      "Enable sharp specular glints on rotating tiles.",

    "lighting.glintStrength":
      "Brightness of specular glints.",

    "motion.drift":
      "Maximum displacement during normal tile drifting.",

    "motion.speed":
      "Speed of the procedural motion field.",

    "motion.assemblySpeed":
      "Controls the response speed of tiles when physics is disabled.",

    "motion.separation":
      "Strength of the assembly and separation cycle.",

    "motion.cycleDuration":
      "Duration of one assembly cycle in seconds.",

    "motion.mode":
      "Choose the primary mosaic animation pattern.",

    "motion.rotation":
      "Maximum natural tile rotation.",

    "motion.breathing":
      "Amplitude of breathing-style depth movement.",

    "motion.explode":
      "Add a global disintegration pulse to the active motion mode.",

    "motion.explodeStrength":
      "Maximum distance tiles move during disintegration.",

    "motion.domino":
      "Overlay a sequential flipping wave.",

    "motion.dominoSpeed":
      "Speed of the domino animation.",

    "physics.enabled":
      "Enable spring-based tile movement and pointer interaction.",

    "physics.repulsion":
      "Push tiles away from the mouse pointer.",

    "physics.attraction":
      "Pull tiles toward the mouse pointer.",

    "physics.vortex":
      "Make nearby tiles circulate around the pointer.",

    "physics.dragBend":
      "Apply additional displacement when dragging the pointer.",

    "physics.radius":
      "Radius of the mouse interaction field.",

    "physics.displacement":
      "Maximum displacement caused by the pointer.",

    "physics.rotation":
      "Rotation applied to tiles affected by interaction.",

    "physics.stiffness":
      "Spring force pulling tiles toward their target positions.",

    "physics.damping":
      "Controls how quickly tile movement settles.",

    "physics.wavePropagation":
      "Use a narrow traveling wavefront for shockwave effects.",

    "physics.waveSpeed":
      "Speed at which shockwaves travel through the mosaic.",

    "physics.shockwaves":
      "Create expanding displacement waves when clicking.",

    "physics.shockStrength":
      "Strength of click-generated shockwaves.",

    "physics.gravityWells":
      "Allow temporary gravity wells using Shift-click.",

    "physics.gravityStrength":
      "Strength of the attraction toward gravity wells.",

    "colors.backgroundColor":
      "Background color behind the mosaic.",

    "colors.colorA":
      "First color in the animated palette.",

    "colors.colorB":
      "Second color in the animated palette.",

    "colors.colorC":
      "Third color in the animated palette.",

    "colors.highlightColor":
      "Color of reflections, glowing edges, and dust.",

    "colors.scale":
      "Spatial size of the animated color regions.",

    "colors.speed":
      "Speed at which color patterns evolve.",

    "colors.flow":
      "Distort color coordinates using procedural noise.",

    "colors.flowStrength":
      "Strength of procedural color distortion.",

    "colors.aurora":
      "Add flowing aurora-like variations to the palette.",

    "colors.heightInfluence":
      "Influence of tile height on its color.",

    "colors.chromaticRipple":
      "Generate color pulses along active shockwaves.",

    "atmosphere.enabled":
      "Enable atmospheric effects and particles.",

    "atmosphere.haze":
      "Intensity of the subtle atmospheric haze.",

    "atmosphere.dust":
      "Enable floating luminous dust particles.",

    "atmosphere.dustCount":
      "Number of atmospheric dust particles.",

    "atmosphere.dustOpacity":
      "Opacity of atmospheric dust particles.",

    "atmosphere.bloom":
      "Enable glowing highlights through a bloom pass.",

    "atmosphere.bloomStrength":
      "Strength of the bloom composite.",

    "atmosphere.bloomThreshold":
      "Brightness required for pixels to contribute to bloom.",

    "atmosphere.depthOfField":
      "Enable approximate screen-space edge blur.",

    "atmosphere.dofStrength":
      "Amount of screen-space blur.",

    "atmosphere.vignette":
      "Darken the corners of the image.",

    "atmosphere.grain":
      "Amount of animated film grain.",

    "atmosphere.chromaticAberration":
      "Separate color channels toward the screen edges.",

    "atmosphere.aberration":
      "Strength of chromatic aberration.",

    "atmosphere.trails":
      "Reserved for temporal motion trails; framebuffer accumulation is not yet implemented.",

    "atmosphere.trailPersistence":
      "Intended persistence of temporal motion trails.",

    "effects.fractures":
      "Highlight procedural fracture-like patterns across the mosaic.",

    "effects.fractureIntensity":
      "Brightness of the fracture patterns.",

    "effects.connections":
      "Enable animated connection-like illumination on tiles.",

    "effects.connectionDistance":
      "Reserved for geometric connections between tiles.",

    "effects.portal":
      "Create a central swirling depression in the mosaic.",

    "effects.portalRadius":
      "Radius of the portal displacement field.",

    "effects.portalStrength":
      "Strength of the portal effect.",

    "effects.scan":
      "Enable a moving holographic scan.",

    "effects.scanSpeed":
      "Speed of the holographic scan.",

    "effects.lightTrails":
      "Reserved for tile motion trails.",

    "effects.mirrorUndersides":
      "Apply a contrasting color to reverse tile surfaces.",

    "effects.hologram":
      "Add holographic color modulation to tile surfaces.",

    "animation.speed":
      "Global simulation speed multiplier.",

    "animation.paused":
      "Pause the simulation.",

    "animation.respectReducedMotion":
      "Pause automatic animation when reduced motion is requested.",

    "animation.quality":
      "Rendering quality preference; adaptive quality tiers are not yet fully implemented.",

    "animation.maxDpr":
      "Maximum device pixel ratio used for rendering.",

    "animation.maxFps":
      "Maximum target rendering frame rate.",

    "animation.adaptiveQuality":
      "Reserved for automatic quality adjustments based on performance.",

    "panel.enabled":
      "Enable or disable the settings panel."
  };

  // ============================================================
  // SECTION DESCRIPTIONS
  // ============================================================

  const sectionDescriptions = {
    tiles:
      "Geometry, size, shape and individual tile variation.",

    camera:
      "Perspective, zoom, orbit and camera movement.",

    materials:
      "Surface appearance, reflections and iridescence.",

    lighting:
      "Directional lighting and specular highlights.",

    motion:
      "Assembly patterns, drifting and animated movement.",

    physics:
      "Spring movement, mouse interaction and shockwaves.",

    colors:
      "Animated palettes and procedural color fields.",

    atmosphere:
      "Bloom, dust, haze and post-processing effects.",

    effects:
      "Fractures, portals and holographic effects.",

    animation:
      "Animation speed and rendering performance.",

    panel:
      "Settings editor visibility."
  };

  // ============================================================
  // EDITOR CSS
  // ============================================================

  const style = document.createElement("style");

  style.textContent = `
    .tessera-editor {
      position: fixed;
      inset: 0;
      z-index: 10000;
      pointer-events: none;
      color: #e7ebf3;
      font: 13px/1.5 system-ui, sans-serif;
      color-scheme: dark;
    }

    .tessera-editor * {
      box-sizing: border-box;
    }

    .tessera-editor button,
    .tessera-editor input,
    .tessera-editor select,
    .tessera-editor textarea {
      font: inherit;
    }

    .tessera-editor button {
      padding: 8px 11px;
      border: 1px solid #ffffff26;
      border-radius: 7px;
      background: #2b3245;
      color: inherit;
      cursor: pointer;
    }

    .tessera-editor button:hover {
      background: #3d485e;
    }

    .tessera-editor :focus-visible {
      outline: 2px solid #b6d0e6;
      outline-offset: 3px;
    }

    .tessera-toggle {
      position: absolute;
      top: 16px;
      right: 16px;
      pointer-events: auto;
    }

    .tessera-panel {
      position: absolute;
      top: 0;
      right: 0;
      width: min(370px, 100vw);
      height: 100%;
      padding: 22px;
      overflow-y: auto;
      overflow-x: hidden;
      border-left: 1px solid #ffffff20;
      background: rgba(12, 18, 29, 0.96);
      backdrop-filter: blur(16px);
      pointer-events: auto;
      transform: translateX(100%);
      transition: transform 220ms ease;
      scrollbar-width: thin;
      scrollbar-color: #526078 transparent;
    }

    .tessera-panel.open {
      transform: translateX(0);
    }

    .tessera-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 8px;
    }

    .tessera-heading h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .tessera-description {
      margin: 0 0 20px;
      color: #aab7ca;
      font-size: 12px;
      line-height: 1.6;
    }

    .tessera-presets {
      margin-bottom: 20px;
      padding: 13px;
      border: 1px solid #ffffff18;
      border-radius: 9px;
      background: #ffffff06;
    }

    .tessera-presets label {
      display: block;
      margin-bottom: 8px;
      color: #bad3e5;
      font-weight: 600;
    }

    .tessera-presets-row {
      display: flex;
      gap: 8px;
    }

    .tessera-presets-row select {
      flex: 1;
      min-width: 0;
    }

    .tessera-panel select {
      padding: 7px 9px;
      border: 1px solid #ffffff24;
      border-radius: 6px;
      background: #202b3d;
      color: #e7ebf3;
      outline: none;
    }

    .tessera-section {
      margin-bottom: 10px;
      border: 1px solid #ffffff16;
      border-radius: 9px;
      background: #ffffff04;
      overflow: visible;
    }

    .tessera-section summary {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 13px 14px;
      cursor: pointer;
      list-style: none;
      color: #c7dcef;
      font-weight: 600;
      user-select: none;
    }

    .tessera-section summary::-webkit-details-marker {
      display: none;
    }

    .tessera-section summary::before {
      content: "▸";
      display: inline-block;
      width: 12px;
      color: #89b9d7;
      transition: transform 160ms ease;
    }

    .tessera-section[open] summary::before {
      transform: rotate(90deg);
    }

    .tessera-section summary:hover {
      background: #ffffff08;
      border-radius: 9px;
    }

    .tessera-section-body {
      padding: 4px 14px 14px;
      border-top: 1px solid #ffffff12;
    }

    .tessera-section-description {
      margin: 8px 0 16px;
      color: #8394aa;
      font-size: 11px;
      line-height: 1.5;
    }

    .tessera-control {
      position: relative;
      margin-bottom: 15px;
      padding: 5px 0;
      border-radius: 5px;
    }

    .tessera-control:last-child {
      margin-bottom: 0;
    }

    .tessera-control:hover {
      background: #ffffff05;
    }

    .tessera-control-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 7px;
    }

    .tessera-control-title label {
      color: #dce5f1;
      cursor: pointer;
    }

    .tessera-control input[type="range"] {
      display: block;
      width: 100%;
      margin: 4px 0;
      accent-color: #91bdd9;
      cursor: pointer;
    }

    .tessera-control input[type="number"] {
      width: 77px;
      padding: 4px 6px;
      border: 1px solid #ffffff24;
      border-radius: 5px;
      background: #ffffff08;
      color: inherit;
      text-align: right;
      font-variant-numeric: tabular-nums;
    }

    .tessera-control input[type="checkbox"] {
      width: 16px;
      height: 16px;
      margin: 0;
      accent-color: #91bdd9;
      cursor: pointer;
    }

    .tessera-control select {
      max-width: 175px;
      font-size: 12px;
    }

    .tessera-colors {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .tessera-colors input[type="color"] {
      flex: 0 0 43px;
      width: 43px;
      height: 31px;
      padding: 2px;
      border: 1px solid #ffffff24;
      border-radius: 5px;
      background: transparent;
      cursor: pointer;
    }

    .tessera-colors input[type="number"] {
      flex: 1;
      min-width: 0;
      width: 0;
      text-align: center;
    }

    .tessera-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 18px;
    }

    .tessera-code {
      width: 100%;
      min-height: 300px;
      margin-top: 14px;
      padding: 12px;
      resize: vertical;
      border: 1px solid #ffffff24;
      border-radius: 7px;
      background: #070d16;
      color: #ccdeed;
      font: 11px/1.6 ui-monospace, monospace !important;
      white-space: pre;
      tab-size: 2;
    }

    .tessera-status {
      min-height: 20px;
      margin-top: 10px;
      color: #aab7ca;
      font-size: 12px;
    }

    /* ----------------------------------------------------------
       EXTERNAL HOVER DESCRIPTION
       ---------------------------------------------------------- */

    .tessera-help {
      position: fixed;
      z-index: 10001;
      width: 290px;
      max-width: calc(100vw - 30px);
      padding: 14px 16px;
      border: 1px solid #ffffff26;
      border-radius: 9px;
      background: rgba(17, 27, 43, 0.97);
      box-shadow:
        0 12px 35px rgba(0, 0, 0, 0.35),
        0 0 20px rgba(70, 157, 177, 0.08);
      color: #dce8f4;
      font-size: 12px;
      line-height: 1.65;
      pointer-events: none;
      opacity: 0;
      visibility: hidden;
      transition:
        opacity 130ms ease,
        visibility 130ms ease;
    }

    .tessera-help.visible {
      opacity: 1;
      visibility: visible;
    }

    .tessera-help-title {
      margin-bottom: 6px;
      color: #9dcce8;
      font-weight: 600;
      font-size: 13px;
    }

    .tessera-help-text {
      color: #b7c5d8;
    }

    @media (max-width: 720px) {
      .tessera-help {
        display: none;
      }

      .tessera-panel {
        width: min(370px, 100vw);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .tessera-panel,
      .tessera-section summary::before,
      .tessera-help {
        transition: none;
      }
    }
  `;

  document.head.append(style);

  // ============================================================
  // ROOT ELEMENT
  // ============================================================

  const root = document.createElement("div");

  root.className = "tessera-editor";
  root.dataset.backgroundEditor = "";

  root.innerHTML = `
    <button
      class="tessera-toggle"
      type="button"
      aria-expanded="false"
      aria-controls="tessera-settings-panel"
    >
      Settings
    </button>

    <aside
      id="tessera-settings-panel"
      class="tessera-panel"
      aria-label="Floating Tesserae settings"
      inert
    >
      <div class="tessera-heading">
        <h2>Floating Tesserae</h2>

        <button
          class="tessera-close"
          type="button"
        >
          Retract
        </button>
      </div>

      <p class="tessera-description">
        Configure the WebGL2 mosaic, camera,
        lighting, physics and visual effects.
        Hover over any setting for details.
      </p>

      <div class="tessera-presets">
        <label for="tessera-preset">
          Visual preset
        </label>

        <div class="tessera-presets-row">
          <select id="tessera-preset">
            <option value="">
              Custom configuration
            </option>
          </select>

          <button
            class="tessera-apply-preset"
            type="button"
          >
            Apply
          </button>
        </div>
      </div>

      <div class="tessera-controls"></div>

      <div class="tessera-actions">
        <button
          class="tessera-show"
          type="button"
        >
          Show code
        </button>

        <button
          class="tessera-copy"
          type="button"
        >
          Copy config
        </button>

        <button
          class="tessera-reset"
          type="button"
        >
          New mosaic
        </button>

        <button
          class="tessera-defaults"
          type="button"
        >
          Restore defaults
        </button>

        <button
          class="tessera-expand"
          type="button"
        >
          Expand all
        </button>

        <button
          class="tessera-collapse"
          type="button"
        >
          Collapse all
        </button>
      </div>

      <textarea
        class="tessera-code"
        aria-label="Configuration code"
        spellcheck="false"
        readonly
        hidden
      ></textarea>

      <div
        class="tessera-status"
        role="status"
        aria-live="polite"
      ></div>
    </aside>

    <div
      class="tessera-help"
      role="tooltip"
      aria-hidden="true"
    >
      <div class="tessera-help-title"></div>
      <div class="tessera-help-text"></div>
    </div>
  `;

  document.body.append(root);

  // ============================================================
  // ELEMENT REFERENCES
  // ============================================================

  const toggle = root.querySelector(
    ".tessera-toggle"
  );

  const panel = root.querySelector(
    ".tessera-panel"
  );

  const close = root.querySelector(
    ".tessera-close"
  );

  const controls = root.querySelector(
    ".tessera-controls"
  );

  const code = root.querySelector(
    ".tessera-code"
  );

  const show = root.querySelector(
    ".tessera-show"
  );

  const status = root.querySelector(
    ".tessera-status"
  );

  const presetSelect = root.querySelector(
    "#tessera-preset"
  );

  const help = root.querySelector(
    ".tessera-help"
  );

  const helpTitle = root.querySelector(
    ".tessera-help-title"
  );

  const helpText = root.querySelector(
    ".tessera-help-text"
  );

  const sectionElements = [];
  const controlBindings = [];

  // ============================================================
  // UTILITIES
  // ============================================================

  function title(value) {
    return value
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, letter => letter.toUpperCase());
  }

  function toHex(color) {
    return "#" + color.map(value =>
      Math.round(value)
        .toString(16)
        .padStart(2, "0")
    ).join("");
  }

  function clamp(value, min, max) {
    return Math.max(
      min,
      Math.min(max, value)
    );
  }

  function element(tag, className) {
    const node = document.createElement(tag);

    if (className) {
      node.className = className;
    }

    return node;
  }

  function clone(value) {
    return JSON.parse(
      JSON.stringify(value)
    );
  }

  function exportCode() {
    return (
      "const config = " +
      JSON.stringify(config, null, 2) +
      ";"
    );
  }

  function setStatus(message) {
    status.textContent = message;
  }

  function changed() {
    code.value = exportCode();

    onChange();

    if (!config.panel.enabled) {
      setOpen(false);
      root.hidden = true;
    }
  }

  // ============================================================
  // PANEL VISIBILITY
  // ============================================================

  function setOpen(open) {
    if (
      !open &&
      panel.contains(document.activeElement)
    ) {
      toggle.focus();
    }

    panel.classList.toggle(
      "open",
      open
    );

    panel.inert = !open;
    toggle.hidden = open;

    toggle.setAttribute(
      "aria-expanded",
      String(open)
    );

    hideHelp();

    if (open) {
      close.focus();
    }
  }

  toggle.addEventListener(
    "click",
    () => setOpen(true)
  );

  close.addEventListener(
    "click",
    () => setOpen(false)
  );

  // ============================================================
  // EXTERNAL HOVER HELP
  // ============================================================

  function showHelp(
    path,
    target,
    customTitle = null
  ) {
    const description =
      descriptions[path] ||
      sectionDescriptions[path];

    if (!description) {
      hideHelp();
      return;
    }

    helpTitle.textContent =
      customTitle ||
      title(path.split(".").pop());

    helpText.textContent = description;

    help.classList.add("visible");

    help.setAttribute(
      "aria-hidden",
      "false"
    );

    positionHelp(target);
  }

  function positionHelp(target) {
    const rect =
      target.getBoundingClientRect();

    const helpWidth = 290;
    const gap = 16;

    const left = Math.max(
      12,
      rect.left - helpWidth - gap
    );

    const height =
      help.offsetHeight || 90;

    const top = clamp(
      rect.top +
        rect.height / 2 -
        height / 2,
      12,
      window.innerHeight - height - 12
    );

    help.style.left = `${left}px`;
    help.style.top = `${top}px`;
  }

  function hideHelp() {
    help.classList.remove("visible");

    help.setAttribute(
      "aria-hidden",
      "true"
    );
  }

  function attachHelp(
    target,
    path,
    customTitle = null
  ) {
    target.addEventListener(
      "mouseenter",
      () => {
        showHelp(
          path,
          target,
          customTitle
        );
      }
    );

    target.addEventListener(
      "mouseleave",
      hideHelp
    );

    target.addEventListener(
      "focusin",
      () => {
        showHelp(
          path,
          target,
          customTitle
        );
      }
    );

    target.addEventListener(
      "focusout",
      hideHelp
    );
  }

  panel.addEventListener(
    "scroll",
    hideHelp,
    {
      passive: true
    }
  );

  // ============================================================
  // CONTROL BINDINGS
  // ============================================================

  function bindControl(update) {
    controlBindings.push(update);
  }

  function refreshControls() {
    for (const update of controlBindings) {
      update();
    }

    code.value = exportCode();
  }

  // ============================================================
  // BOOLEAN CONTROLS
  // ============================================================

  function createBooleanControl(
    group,
    key,
    path,
    heading,
    id
  ) {
    const input = element("input");

    input.type = "checkbox";
    input.id = id;
    input.checked = group[key];

    input.addEventListener(
      "change",
      () => {
        group[key] = input.checked;
        changed();
      }
    );

    heading.append(input);

    bindControl(() => {
      input.checked = group[key];
    });
  }

  // ============================================================
  // SELECT CONTROLS
  // ============================================================

  function createSelectControl(
    group,
    key,
    path,
    heading,
    id
  ) {
    const select = element("select");

    select.id = id;

    const options =
      selectOptions[path] || [];

    for (const [value, label] of options) {
      const option = element("option");

      option.value = value;
      option.textContent = label;

      select.append(option);
    }

    select.value = group[key];

    select.addEventListener(
      "change",
      () => {
        group[key] = select.value;
        changed();
      }
    );

    heading.append(select);

    bindControl(() => {
      select.value = group[key];
    });
  }

  // ============================================================
  // COLOR CONTROLS
  // ============================================================

  function createColorControl(
    group,
    key,
    path,
    container,
    id
  ) {
    const row = element(
      "div",
      "tessera-colors"
    );

    const picker = element("input");

    picker.type = "color";
    picker.id = id;
    picker.value = toHex(group[key]);

    row.append(picker);

    const channels = [];

    for (let index = 0; index < 3; index++) {
      const input = element("input");

      input.type = "number";
      input.min = 0;
      input.max = 255;
      input.step = 1;

      input.value = group[key][index];

      input.setAttribute(
        "aria-label",
        `${title(key)} ${
          ["red", "green", "blue"][index]
        }`
      );

      input.addEventListener(
        "input",
        () => {
          if (input.value === "") {
            return;
          }

          const value = Number(input.value);

          if (!Number.isFinite(value)) {
            return;
          }

          group[key][index] = Math.round(
            clamp(value, 0, 255)
          );

          picker.value = toHex(
            group[key]
          );

          changed();
        }
      );

      input.addEventListener(
        "change",
        () => {
          input.value =
            group[key][index];
        }
      );

      channels.push(input);
      row.append(input);
    }

    picker.addEventListener(
      "input",
      () => {
        const hex = picker.value;

        group[key] = [1, 3, 5].map(
          offset => parseInt(
            hex.slice(
              offset,
              offset + 2
            ),
            16
          )
        );

        channels.forEach(
          (input, index) => {
            input.value =
              group[key][index];
          }
        );

        changed();
      }
    );

    container.append(row);

    bindControl(() => {
      picker.value = toHex(group[key]);

      channels.forEach(
        (input, index) => {
          input.value =
            group[key][index];
        }
      );
    });
  }

  // ============================================================
  // NUMERIC CONTROLS
  // ============================================================

  function createNumberControl(
    group,
    key,
    path,
    heading,
    container,
    id
  ) {
    const [
      min,
      max,
      step
    ] = limits[path] || [0, 100, 1];

    const number = element("input");
    const range = element("input");

    number.type = "number";
    number.id = id;

    range.type = "range";

    range.setAttribute(
      "aria-label",
      title(key)
    );

    function normalize(raw) {
      const clamped = clamp(
        raw,
        min,
        max
      );

      const stepped =
        min +
        Math.round(
          (clamped - min) / step
        ) * step;

      return Number(
        clamp(
          stepped,
          min,
          max
        ).toFixed(6)
      );
    }

    for (const input of [number, range]) {
      input.min = min;
      input.max = max;
      input.step = step;
      input.value = group[key];

      input.addEventListener(
        "input",
        () => {
          if (input.value === "") {
            return;
          }

          const parsed = Number(
            input.value
          );

          if (!Number.isFinite(parsed)) {
            return;
          }

          group[key] = normalize(
            parsed
          );

          if (input === number) {
            range.value = group[key];
          } else {
            number.value = group[key];
          }

          changed();
        }
      );

      input.addEventListener(
        "change",
        () => {
          input.value = group[key];
        }
      );
    }

    heading.append(number);
    container.append(range);

    bindControl(() => {
      number.value = group[key];
      range.value = group[key];
    });
  }

  // ============================================================
  // BUILD COLLAPSIBLE SETTINGS SECTIONS
  // ============================================================

  for (
    const [groupName, group] of
    Object.entries(config)
  ) {
    const section = element(
      "details",
      "tessera-section"
    );

    const summary = element("summary");

    summary.textContent = title(
      groupName
    );

    section.append(summary);

    const body = element(
      "div",
      "tessera-section-body"
    );

    const description = element(
      "p",
      "tessera-section-description"
    );

    description.textContent =
      sectionDescriptions[groupName] || "";

    body.append(description);

    attachHelp(
      summary,
      groupName,
      title(groupName)
    );

    for (
      const [key, value] of
      Object.entries(group)
    ) {
      const path =
        `${groupName}.${key}`;

      const id =
        `tessera-${groupName}-${key}`;

      const container = element(
        "div",
        "tessera-control"
      );

      const heading = element(
        "div",
        "tessera-control-title"
      );

      const label = element("label");

      label.textContent = title(key);
      label.htmlFor = id;

      heading.append(label);
      container.append(heading);

      attachHelp(
        container,
        path,
        title(key)
      );

      if (typeof value === "boolean") {
        createBooleanControl(
          group,
          key,
          path,
          heading,
          id
        );
      } else if (Array.isArray(value)) {
        createColorControl(
          group,
          key,
          path,
          container,
          id
        );
      } else if (typeof value === "string") {
        createSelectControl(
          group,
          key,
          path,
          heading,
          id
        );
      } else if (typeof value === "number") {
        createNumberControl(
          group,
          key,
          path,
          heading,
          container,
          id
        );
      }

      body.append(container);
    }

    section.append(body);
    controls.append(section);

    sectionElements.push(section);
  }

  // Keep the first section expanded initially.
  if (sectionElements.length > 0) {
    sectionElements[0].open = true;
  }

  // ============================================================
  // PRESET SELECTOR
  // ============================================================

  for (const name of Object.keys(presets)) {
    const option = element("option");

    option.value = name;
    option.textContent = title(name);

    presetSelect.append(option);
  }

  root.querySelector(
    ".tessera-apply-preset"
  ).addEventListener(
    "click",
    () => {
      const name = presetSelect.value;

      if (!name) {
        setStatus(
          "Select a preset first."
        );

        return;
      }

      onPreset(name);

      refreshControls();

      setStatus(
        `${title(name)} preset applied.`
      );
    }
  );

  // ============================================================
  // SHOW CONFIGURATION
  // ============================================================

  show.addEventListener(
    "click",
    () => {
      code.hidden = !code.hidden;

      code.value = exportCode();

      show.textContent = code.hidden
        ? "Show code"
        : "Hide code";
    }
  );

  // ============================================================
  // COPY CONFIGURATION
  // ============================================================

  root.querySelector(
    ".tessera-copy"
  ).addEventListener(
    "click",
    async () => {
      code.value = exportCode();

      try {
        await navigator.clipboard.writeText(
          code.value
        );

        setStatus(
          "Configuration copied."
        );
      } catch {
        code.hidden = false;

        show.textContent =
          "Hide code";

        code.focus();
        code.select();

        setStatus(
          "Press Ctrl+C or Cmd+C to copy."
        );
      }
    }
  );

  // ============================================================
  // GENERATE NEW MOSAIC
  // ============================================================

  root.querySelector(
    ".tessera-reset"
  ).addEventListener(
    "click",
    () => {
      onReset();

      setStatus(
        "A new mosaic has been generated."
      );
    }
  );

  // ============================================================
  // RESTORE DEFAULT CONFIGURATION
  // ============================================================

  root.querySelector(
    ".tessera-defaults"
  ).addEventListener(
    "click",
    () => {
      for (
        const [groupName, values] of
        Object.entries(defaults)
      ) {
        if (!config[groupName]) {
          continue;
        }

        for (
          const [key, value] of
          Object.entries(values)
        ) {
          config[groupName][key] = clone(
            value
          );
        }
      }

      root.hidden = false;

      presetSelect.value = "";

      refreshControls();

      onChange();
      onReset();

      setStatus(
        "Default configuration restored."
      );
    }
  );

  // ============================================================
  // EXPAND AND COLLAPSE ALL
  // ============================================================

  root.querySelector(
    ".tessera-expand"
  ).addEventListener(
    "click",
    () => {
      for (const section of sectionElements) {
        section.open = true;
      }

      hideHelp();
    }
  );

  root.querySelector(
    ".tessera-collapse"
  ).addEventListener(
    "click",
    () => {
      for (const section of sectionElements) {
        section.open = false;
      }

      hideHelp();
    }
  );

  // ============================================================
  // KEYBOARD HANDLING
  // ============================================================

  function onKeyDown(event) {
    if (
      event.key === "Escape" &&
      panel.classList.contains("open")
    ) {
      setOpen(false);
    }
  }

  document.addEventListener(
    "keydown",
    onKeyDown
  );

  // ============================================================
  // INITIALIZATION
  // ============================================================

  code.value = exportCode();

  // ============================================================
  // CLEANUP
  // ============================================================

  return {
    refresh() {
      refreshControls();
    },

    open() {
      setOpen(true);
    },

    close() {
      setOpen(false);
    },

    destroy() {
      document.removeEventListener(
        "keydown",
        onKeyDown
      );

      root.remove();
      style.remove();
    }
  };
}
