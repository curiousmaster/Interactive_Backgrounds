"use strict";

export function createSettingsEditor({
    config,
    onChange = () => {},
    onReset = () => {}
}) {
    const limits = {
        "embers.count": [10, 600, 1],
        "embers.size": [0.5, 6, 0.1],
        "embers.speed": [10, 200, 1],
        "embers.trailLength": [0, 4, 0.1],
        "embers.opacity": [0, 1, 0.01],
        "embers.glow": [0, 25, 0.5],

        "flock.neighborRadius": [30, 180, 1],
        "flock.separationDistance": [5, 50, 1],
        "flock.cohesion": [0, 2, 0.05],
        "flock.alignment": [0, 3, 0.05],
        "flock.separation": [0, 3, 0.05],
        "flock.formationStrength": [0, 2, 0.05],

        "mouse.radius": [40, 500, 1],
        "mouse.beaconStrength": [0, 300, 1],
        "mouse.smoothing": [0.5, 20, 0.1],

        "cooling.scattering": [0, 400, 1],
        "cooling.waveSpeed": [50, 600, 1],
        "cooling.waveWidth": [20, 180, 1],
        "cooling.waveLifetime": [0.5, 5, 0.1],
        "cooling.coolingTime": [0.5, 15, 0.1],

        "wind.strength": [0, 100, 1],
        "wind.scale": [80, 800, 10],
        "wind.speed": [0, 2, 0.01],

        "vortices.count": [1, 4, 1],
        "vortices.radius": [60, 600, 10],
        "vortices.strength": [0, 160, 1],
        "vortices.drift": [0, 1, 0.01],

        "thermal.strength": [0, 100, 1],
        "thermal.scale": [80, 800, 10],
        "thermal.reheating": [0, 2, 0.05],

        "depth.strength": [0, 1, 0.01],
        "depth.foregroundBlur": [0, 4, 0.1],
        "depth.parallax": [0, 60, 1],

        "sparks.rate": [0, 3, 0.05],
        "sparks.speed": [0, 120, 1],
        "sparks.lifetime": [0.1, 3, 0.1],
        "sparks.size": [0.2, 3, 0.05],
        "sparks.maxCount": [0, 2000, 10],

        "heroes.chance": [0, 0.3, 0.005],
        "heroes.size": [1, 3, 0.05],
        "heroes.brightness": [1, 3, 0.05],

        "breathing.strength": [0, 0.9, 0.01],
        "breathing.speed": [0, 5, 0.05],

        "smoke.opacity": [0, 0.4, 0.005],
        "smoke.scale": [100, 1000, 10],
        "smoke.speed": [0, 1, 0.01],

        "bloom.intensity": [0, 2, 0.01],
        "bloom.spread": [0.2, 3, 0.05],

        "animation.speed": [0, 3, 0.05],

        "rendering.pixelRatio": [0.75, 2, 0.25],
        "rendering.trailSamples": [10, 50, 1]
    };

    const help = {
        "embers.count": "Number of flocking embers. Higher counts increase simulation and rendering work.",
        "embers.size": "Base radius of each ember in CSS pixels.",
        "embers.speed": "Preferred migration speed. Forces can temporarily change an ember's speed.",
        "embers.trailLength": "Trail duration in simulated seconds. Zero hides trails.",
        "embers.opacity": "Overall brightness of embers and trails.",
        "embers.glow": "Base halo width when Bloom is enabled.",

        "flock.neighborRadius": "Distance within which embers influence one another.",
        "flock.separationDistance": "Distance below which neighboring embers push apart.",
        "flock.cohesion": "How strongly embers move toward their neighbors' center.",
        "flock.alignment": "How strongly embers align their velocities with nearby embers.",
        "flock.separation": "Strength of short-range collision avoidance.",
        "flock.formationStrength": "Strength of the original broad migration current.",

        "mouse.enabled": "Enable pointer attraction and the optional pointer halo.",
        "mouse.radius": "Range of pointer attraction.",
        "mouse.beaconStrength": "Strength of attraction toward the pointer. Cooled embers respond less.",
        "mouse.smoothing": "How quickly pointer position and influence respond.",
        "mouse.showHalo": "Show a faint warm halo behind the pointer.",

        "cooling.enabled": "Click or tap the background to send a scattering and cooling wave. Disable to remove active waves.",
        "cooling.scattering": "Outward acceleration caused by a cooling wave.",
        "cooling.waveSpeed": "Expansion speed of cooling waves.",
        "cooling.waveWidth": "Width of the region that scatters and cools embers.",
        "cooling.waveLifetime": "Duration of a cooling wave.",
        "cooling.coolingTime": "Cooling half-life. Larger values keep embers blue for longer. Thermal reheating can accelerate recovery.",

        "wind.enabled": "Add smooth changing currents over the original migration field.",
        "wind.strength": "Strength of the additional wind forces.",
        "wind.scale": "Size of wind structures. Larger values produce broader currents.",
        "wind.speed": "How quickly wind currents evolve.",

        "vortices.enabled": "Add drifting whirlpools with alternating rotation directions.",
        "vortices.count": "Number of moving vortices.",
        "vortices.radius": "Size of each vortex's influence.",
        "vortices.strength": "Strength of the swirling forces.",
        "vortices.drift": "Speed at which vortex centers move. Zero keeps them stationary.",
        "vortices.showHalo": "Reveal vortex locations with subtle spiral illumination.",

        "thermal.enabled": "Add warm rising regions that lift and reheat embers.",
        "thermal.strength": "Upward acceleration inside thermal regions.",
        "thermal.scale": "Spacing and size of thermal regions.",
        "thermal.reheating": "Additional speed at which cooled embers regain warmth in thermal regions.",

        "depth.enabled": "Give embers different apparent depths, affecting size and preferred speed.",
        "depth.strength": "Difference between distant and foreground embers.",
        "depth.foregroundBlur": "Softness of the closest ember cores and trails.",
        "depth.parallax": "Subtle depth-dependent shift as the pointer moves. Zero disables parallax.",

        "sparks.enabled": "Allow hot embers to shed small fading sparks.",
        "sparks.rate": "Expected sparks emitted per ember per simulated second. Cooled embers emit fewer.",
        "sparks.speed": "Random spark velocity added to inherited ember motion.",
        "sparks.lifetime": "Typical spark duration.",
        "sparks.size": "Typical spark radius.",
        "sparks.maxCount": "Maximum number of active sparks.",

        "heroes.enabled": "Allow a small fraction of larger and brighter embers.",
        "heroes.chance": "Fraction selected as hero embers. Selection refreshes when an ember wraps around the screen.",
        "heroes.size": "Size multiplier for hero embers.",
        "heroes.brightness": "Brightness multiplier for hero embers.",

        "breathing.enabled": "Make embers gently pulse with independent phases.",
        "breathing.strength": "Depth of brightness variation.",
        "breathing.speed": "Speed of ember breathing.",

        "smoke.enabled": "Show a subtle animated smoke field behind the flock.",
        "smoke.opacity": "Brightness of the smoke.",
        "smoke.scale": "Size of the smoke folds.",
        "smoke.speed": "How quickly the smoke changes.",
        "smoke.color": "RGB color of the smoke illumination.",

        "bloom.enabled": "Show soft Gaussian halos around ember heads and sparks.",
        "bloom.intensity": "Brightness of the halos.",
        "bloom.spread": "Multiplier for halo width. Larger halos increase pixel processing.",

        "appearance.backgroundColor": "Background RGB color.",
        "appearance.hotColor": "Color of the hottest embers.",
        "appearance.warmColor": "Secondary warm color used for individual variation.",
        "appearance.coolColor": "Color of cooled embers and cooling-wave rings.",

        "animation.speed": "Speed multiplier for the entire simulation.",
        "animation.paused": "Freeze simulation and animated effects. Pointer smoothing and settings remain responsive.",
        "animation.respectReducedMotion": "Freeze animation when the operating system requests reduced motion.",

        "rendering.pixelRatio": "Maximum rendering pixel ratio. Lower values improve performance; higher values increase sharpness.",
        "rendering.trailSamples": "History samples per simulated second. Higher values produce smoother trails but more geometry.",

        "panel.enabled": "Hide the settings editor. Copy your configuration first. Reload restores it unless disabled in index.html."
    };

    const groupNames = {
        embers: "Embers",
        flock: "Flock behavior",
        mouse: "Mouse beacon",
        cooling: "Cooling waves",
        wind: "Wind currents",
        vortices: "Drifting vortices",
        thermal: "Thermal updrafts",
        depth: "Depth layers",
        sparks: "Shedding sparks",
        heroes: "Hero embers",
        breathing: "Breathing light",
        smoke: "Animated smoke",
        bloom: "Soft bloom",
        appearance: "Appearance",
        animation: "Animation",
        rendering: "Rendering",
        panel: "Editor"
    };

    const title = value => value
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, letter => letter.toUpperCase());

    const clamp = (value, min, max) =>
        Math.max(min, Math.min(max, value));

    const style = document.createElement("style");

    style.textContent = `
        .ember-editor,
        .ember-editor * {
            box-sizing: border-box;
        }

        .ember-editor {
            color: #f0e7e7;
            font: 12px/1.5 system-ui, sans-serif;
            color-scheme: dark;
        }

        .ember-editor [hidden] {
            display: none !important;
        }

        .ember-editor button,
        .ember-editor input,
        .ember-editor textarea {
            font: inherit;
        }

        .ember-editor button {
            min-height: 38px;
            padding: 8px 10px;
            border: 1px solid #ffffff26;
            border-radius: 7px;
            background: #3c2934;
            color: inherit;
            cursor: pointer;
        }

        .ember-editor button:hover {
            background: #573b47;
        }

        .ember-editor :focus-visible {
            outline: 2px solid #e4b38b;
            outline-offset: 3px;
        }

        .ember-toggle {
            position: fixed;
            top: 16px;
            right: 16px;
            z-index: 1000;
        }

        .ember-panel {
            position: fixed;
            inset: 0 0 0 auto;
            z-index: 1001;
            width: min(350px, 100vw);
            display: flex;
            flex-direction: column;
            border-left: 1px solid #ffffff20;
            background: rgba(25, 14, 22, .97);
            transform: translateX(100%);
            transition: transform 220ms ease;
        }

        .ember-panel.open {
            transform: translateX(0);
        }

        .ember-heading {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 16px;
            border-bottom: 1px solid #ffffff20;
        }

        .ember-heading strong {
            font-size: 16px;
        }

        .ember-body {
            flex: 1;
            min-height: 0;
            overflow-y: auto;
            overscroll-behavior: contain;
            padding: 0 16px 20px;
        }

        .ember-description {
            color: #c3aeb7;
            font-size: 11px;
        }

        .ember-panel details {
            margin: 12px 0;
            padding: 11px;
            border: 1px solid #ffffff20;
            border-radius: 8px;
        }

        .ember-panel summary {
            color: #e2bf9c;
            font-weight: 600;
            cursor: pointer;
        }

        .ember-panel details[open] > summary {
            margin-bottom: 15px;
        }

        .ember-control {
            margin-bottom: 14px;
        }

        .ember-control:last-child {
            margin-bottom: 0;
        }

        .ember-control-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 6px;
        }

        .ember-control label {
            cursor: help;
        }

        .ember-panel input[type=range] {
            width: 100%;
            margin: 0;
            accent-color: #d3a780;
        }

        .ember-panel input[type=number] {
            width: 76px;
            padding: 5px 6px;
            border: 1px solid #ffffff24;
            border-radius: 5px;
            background: #ffffff08;
            color: inherit;
        }

        .ember-panel input[type=checkbox] {
            accent-color: #d3a780;
        }

        .ember-colors {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .ember-panel input[type=color] {
            flex: 0 0 40px;
            width: 40px;
            height: 32px;
            padding: 2px;
            border: 1px solid #ffffff24;
            border-radius: 5px;
            background: transparent;
        }

        .ember-colors input[type=number] {
            width: 100%;
            min-width: 0;
        }

        .ember-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 16px;
        }

        .ember-code {
            width: 100%;
            height: 330px;
            margin-top: 14px;
            padding: 10px;
            resize: vertical;
            border: 1px solid #ffffff24;
            border-radius: 7px;
            background: #110911;
            color: #e8d0c7;
            font: 11px/1.5 monospace !important;
            white-space: pre;
        }

        .ember-status {
            min-height: 20px;
            margin-top: 10px;
            color: #bdd7b9;
        }

        .ember-tooltip {
            position: fixed;
            z-index: 1003;
            width: 245px;
            padding: 12px 14px;
            background: rgba(46, 29, 39, .98);
            border: 1px solid #947061;
            border-radius: 8px;
            color: #f2dfd5;
            box-shadow: 0 8px 24px #0009;
            pointer-events: none;
        }

        @media (prefers-reduced-motion: reduce) {
            .ember-panel {
                transition: none;
            }
        }
    `;

    document.head.append(style);

    const root = document.createElement("div");

    root.className = "ember-editor";
    root.dataset.backgroundEditor = "";

    root.innerHTML = `
        <button
            class="ember-toggle"
            type="button"
            aria-expanded="false"
        >Settings</button>

        <aside
            class="ember-panel"
            aria-label="Ember Migration settings"
            inert
        >
            <div class="ember-heading">
                <strong>Ember Migration</strong>
                <button class="ember-close" type="button">
                    Retract →
                </button>
            </div>

            <div class="ember-body">
                <p class="ember-description">
                    Move the pointer to attract embers.
                    Click or tap to scatter and cool them.
                    Click section headings to fold them.
                    Hover over settings for descriptions.
                </p>

                <div class="ember-controls"></div>

                <div class="ember-actions">
                    <button class="ember-show" type="button">
                        Show code
                    </button>
                    <button class="ember-copy" type="button">
                        Copy config
                    </button>
                    <button class="ember-reset" type="button">
                        New flock
                    </button>
                </div>

                <textarea
                    class="ember-code"
                    aria-label="Configuration code"
                    spellcheck="false"
                    readonly
                    hidden
                ></textarea>

                <div class="ember-status" role="status"></div>

                <p class="ember-description">
                    Paste your copied configuration into index.html
                    to retain your settings.
                </p>
            </div>
        </aside>

        <div class="ember-tooltip" role="tooltip" hidden></div>
    `;

    document.body.append(root);

    const find = selector => root.querySelector(selector);

    const toggle = find(".ember-toggle");
    const panel = find(".ember-panel");
    const close = find(".ember-close");
    const controls = find(".ember-controls");
    const code = find(".ember-code");
    const show = find(".ember-show");
    const status = find(".ember-status");
    const tooltip = find(".ember-tooltip");

    let idCounter = 0;

    const exportCode = () =>
        `const config = ${JSON.stringify(config, null, 4)};`;

    function hideHelp() {
        tooltip.hidden = true;
    }

    function showHelp(container, description) {
        tooltip.textContent = description;
        tooltip.hidden = false;

        const panelRect = panel.getBoundingClientRect();
        const rect = container.getBoundingClientRect();
        const width = Math.min(245, Math.max(1, innerWidth - 16));

        tooltip.style.width = width + "px";

        const left = clamp(
            panelRect.left - width - 12,
            8,
            Math.max(8, innerWidth - width - 8)
        );

        const top = clamp(
            rect.top,
            8,
            Math.max(8, innerHeight - tooltip.offsetHeight - 8)
        );

        tooltip.style.left = left + "px";
        tooltip.style.top = top + "px";
    }

    function setOpen(open) {
        hideHelp();

        open = Boolean(open && config.panel.enabled);

        panel.classList.toggle("open", open);
        panel.inert = !open;

        toggle.hidden = open || !config.panel.enabled;
        toggle.setAttribute("aria-expanded", String(open));

        if (open) close.focus();
        else if (config.panel.enabled) toggle.focus();
    }

    function changed(path) {
        code.value = exportCode();
        status.textContent = "";
        onChange(path);

        if (!config.panel.enabled) {
            setOpen(false);
            root.hidden = true;
        }
    }

    function element(tag, className) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        return node;
    }

    function toHex(color) {
        return "#" + color.map(value =>
            Math.round(clamp(value, 0, 255))
                .toString(16)
                .padStart(2, "0")
        ).join("");
    }

    for (const [groupName, group] of Object.entries(config)) {
        const section = element("details");
        const summary = element("summary");

        summary.textContent = groupNames[groupName] || title(groupName);
        section.open = groupName === "embers";

        section.append(summary);
        section.addEventListener("toggle", hideHelp);

        for (const [key, value] of Object.entries(group)) {
            const path = `${groupName}.${key}`;
            const description = help[path] || title(key);

            const container = element("div", "ember-control");
            const heading = element("div", "ember-control-title");
            const label = element("label");
            const id = `ember-control-${idCounter++}`;

            label.textContent = title(key);
            label.htmlFor = id;

            heading.append(label);
            container.append(heading);

            const accessibleHelp = element("span");

            accessibleHelp.id = id + "-help";
            accessibleHelp.hidden = true;
            accessibleHelp.textContent = description;

            container.append(accessibleHelp);

            container.addEventListener("pointerenter", () => {
                showHelp(container, description);
            });

            container.addEventListener("pointerleave", () => {
                if (!container.contains(document.activeElement)) {
                    hideHelp();
                }
            });

            container.addEventListener("focusin", () => {
                showHelp(container, description);
            });

            container.addEventListener("focusout", event => {
                if (!container.contains(event.relatedTarget)) {
                    hideHelp();
                }
            });

            if (typeof value === "boolean") {
                const input = element("input");

                input.id = id;
                input.type = "checkbox";
                input.checked = value;

                input.onchange = () => {
                    group[key] = input.checked;
                    changed(path);
                };

                heading.append(input);

            } else if (Array.isArray(value)) {
                const row = element("div", "ember-colors");
                const picker = element("input");

                picker.id = id;
                picker.type = "color";
                picker.value = toHex(value);

                row.append(picker);

                const channels = value.map((channel, index) => {
                    const input = element("input");

                    input.type = "number";
                    input.min = 0;
                    input.max = 255;
                    input.step = 1;
                    input.value = channel;

                    input.setAttribute(
                        "aria-label",
                        `${title(key)} ${["red", "green", "blue"][index]}`
                    );

                    input.oninput = () => {
                        const parsed = input.valueAsNumber;
                        if (!Number.isFinite(parsed)) return;

                        group[key][index] = Math.round(
                            clamp(parsed, 0, 255)
                        );

                        picker.value = toHex(group[key]);
                        changed(path);
                    };

                    input.onchange = () => {
                        input.value = group[key][index];
                    };

                    row.append(input);
                    return input;
                });

                picker.oninput = () => {
                    group[key] = [1, 3, 5].map(start =>
                        parseInt(
                            picker.value.slice(start, start + 2),
                            16
                        )
                    );

                    channels.forEach((input, index) => {
                        input.value = group[key][index];
                    });

                    changed(path);
                };

                container.append(row);

            } else if (typeof value === "number") {
                const [min, max, step] = limits[path] || [0, 100, 1];

                const number = element("input");
                const range = element("input");

                number.id = id;
                number.type = "number";
                range.type = "range";
                range.setAttribute("aria-label", title(key));

                function normalize(raw) {
                    const clamped = clamp(raw, min, max);

                    const stepped =
                        min + Math.round((clamped - min) / step) * step;

                    return Number(
                        clamp(stepped, min, max).toFixed(6)
                    );
                }

                for (const input of [number, range]) {
                    input.min = min;
                    input.max = max;
                    input.step = step;
                    input.value = value;

                    input.oninput = () => {
                        const parsed = input.valueAsNumber;
                        if (!Number.isFinite(parsed)) return;

                        group[key] = normalize(parsed);

                        if (input === number) {
                            range.value = group[key];
                        } else {
                            number.value = group[key];
                        }

                        changed(path);
                    };

                    input.onchange = () => {
                        input.value = group[key];
                    };
                }

                heading.append(number);
                container.append(range);
            }

            container.querySelectorAll("input").forEach(input => {
                input.setAttribute(
                    "aria-describedby",
                    accessibleHelp.id
                );
            });

            section.append(container);
        }

        controls.append(section);
    }

    toggle.onclick = () => setOpen(true);
    close.onclick = () => setOpen(false);

    show.onclick = () => {
        code.hidden = !code.hidden;
        code.value = exportCode();

        show.textContent = code.hidden ? "Show code" : "Hide code";
        show.setAttribute("aria-expanded", String(!code.hidden));
    };

    find(".ember-copy").onclick = async () => {
        code.value = exportCode();

        try {
            await navigator.clipboard.writeText(code.value);
            status.textContent = "Configuration copied.";
        } catch {
            code.hidden = false;
            show.textContent = "Hide code";
            show.setAttribute("aria-expanded", "true");

            code.focus();
            code.select();

            status.textContent = "Press Ctrl+C or ⌘C to copy.";
        }
    };

    find(".ember-reset").onclick = () => {
        onReset();
        status.textContent = "A new ember flock has been generated.";
    };

    function onKeyDown(event) {
        if (
            event.key === "Escape" &&
            panel.classList.contains("open")
        ) {
            setOpen(false);
        }
    }

    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", hideHelp);
    find(".ember-body").addEventListener("scroll", hideHelp);

    code.value = exportCode();
    root.hidden = !config.panel.enabled;

    return {
        destroy() {
            document.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("resize", hideHelp);

            root.remove();
            style.remove();
        }
    };
}