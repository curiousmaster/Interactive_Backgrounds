"use strict";

export function createSettingsEditor({
    config,
    onChange = () => {},
    onReset = () => {}
}) {
    // Numeric setting limits: minimum, maximum, step.
    const limits = {
        "rain.count": [1, 600, 1],
        "rain.speed": [0, 500, 1],
        "rain.direction": [-180, 180, 1],
        "rain.length": [10, 300, 1],
        "rain.width": [0.2, 4, 0.1],
        "rain.opacity": [0, 1, 0.01],
        "rain.depthVariation": [0, 0.9, 0.01],

        "prisms.bands": [0, 8, 1],
        "prisms.angle": [-180, 180, 1],
        "prisms.spacing": [40, 500, 1],
        "prisms.thickness": [10, 250, 1],
        "prisms.strength": [0, 150, 1],
        "prisms.separation": [0, 100, 1],
        "prisms.drift": [0, 150, 1],
        "prisms.bandOpacity": [0, 0.2, 0.005],

        "spectrum.channels": [3, 11, 1],
        "spectrum.spread": [0.2, 3, 0.05],
        "spectrum.saturation": [0, 1, 0.01],

        "glass.opacity": [0, 0.25, 0.005],
        "glass.edgeBrightness": [0, 0.8, 0.01],
        "glass.iridescence": [0, 1, 0.01],

        "flashes.brightness": [0, 3, 0.05],
        "flashes.size": [0.5, 10, 0.5],
        "flashes.lifetime": [0.1, 1.5, 0.05],
        "flashes.fragments": [0, 12, 1],

        "depth.strength": [0, 1, 0.01],
        "depth.foregroundBlur": [0, 5, 0.1],
        "depth.parallax": [0, 60, 1],

        "bloom.intensity": [0, 2, 0.01],
        "bloom.spread": [0.2, 3, 0.05],

        "waves.amplitude": [0, 0.95, 0.01],
        "waves.wavelength": [80, 1000, 10],
        "waves.speed": [0, 250, 1],

        "mouse.radius": [40, 500, 1],
        "mouse.strength": [0, 200, 1],
        "mouse.separation": [0, 150, 1],
        "mouse.smoothing": [0.5, 20, 0.1],

        "lens.strength": [0, 150, 1],
        "lens.separation": [0, 100, 1],
        "lens.ringOpacity": [0, 0.4, 0.005],

        "ripples.speed": [40, 700, 10],
        "ripples.width": [10, 180, 1],
        "ripples.strength": [0, 120, 1],
        "ripples.separation": [0, 100, 1],
        "ripples.lifetime": [0.5, 8, 0.1],
        "ripples.opacity": [0, 0.4, 0.005],

        "heroes.chance": [0, 0.3, 0.005],
        "heroes.brightness": [1, 4, 0.1],
        "heroes.length": [1, 3, 0.1],
        "heroes.width": [1, 3, 0.1],

        "appearance.glow": [0, 30, 0.5],
        "animation.speed": [0, 3, 0.05],

        "rendering.samples": [8, 36, 1],
        "rendering.pixelRatio": [0.75, 2, 0.25]
    };

    const descriptions = {
        "rain.count": "Number of rain trails. More drops increase density and rendering work.",
        "rain.speed": "Base falling speed in CSS pixels per second.",
        "rain.direction": "Rain direction in degrees. Zero falls downward.",
        "rain.length": "Base length of each luminous trail.",
        "rain.width": "Base thickness of the rain strands.",
        "rain.opacity": "Brightness contribution of the rain.",
        "rain.depthVariation": "Original depth variation affecting trail size, speed and brightness.",

        "prisms.bands": "Number of refracting prism bands. Zero removes the prism field.",
        "prisms.angle": "Rotation of the prism arrangement.",
        "prisms.spacing": "Distance between neighboring prism bands.",
        "prisms.thickness": "Width scale of each prism field and half-width of its visible glass ribbon.",
        "prisms.strength": "How strongly the prism fields bend the rain.",
        "prisms.separation": "How far colored strands separate inside prism fields.",
        "prisms.drift": "Amount of slow sideways prism movement.",
        "prisms.showBands": "Show the original soft band illumination. Glass ribbons have their own toggle.",
        "prisms.bandOpacity": "Brightness of the original soft band illumination.",

        "spectrum.enabled": "Replace the original three colored strands with smoothly graded spectral strands.",
        "spectrum.channels": "Number of spectral strands per drop. Higher values create a fuller spectrum and require more processing.",
        "spectrum.spread": "Multiplier for spectral separation. Strands merge where the refraction field approaches zero.",
        "spectrum.saturation": "Color strength of the spectrum. Zero approaches the core color.",

        "glass.enabled": "Show translucent glass ribbons with luminous edges and shifting color.",
        "glass.opacity": "Brightness of the glass interiors.",
        "glass.edgeBrightness": "Brightness of the thin illuminated glass edges.",
        "glass.iridescence": "Strength of shifting colors inside the glass.",

        "flashes.enabled": "Create glints and fragments when rain heads enter or leave prism ribbons.",
        "flashes.brightness": "Brightness of crossing glints and fragments.",
        "flashes.size": "Size of the main crossing glint.",
        "flashes.lifetime": "Duration of crossing glints. Fragments have varied lifetimes.",
        "flashes.fragments": "Number of small spectral fragments emitted with each glint.",

        "depth.enabled": "Add stronger cinematic depth layering and optional pointer parallax.",
        "depth.strength": "Difference between distant and foreground rain.",
        "depth.foregroundBlur": "Softness of the closest rain trails.",
        "depth.parallax": "Subtle pointer-driven shift between depth layers. Set to zero to disable parallax.",

        "bloom.enabled": "Add soft Gaussian light halos around rain and flashes.",
        "bloom.intensity": "Brightness of the soft light surrounding luminous geometry.",
        "bloom.spread": "Multiplier for halo width. Large values increase pixel processing.",

        "waves.enabled": "Send slow traveling waves along the prism bands.",
        "waves.amplitude": "How strongly traveling waves vary bending, dispersion and glass illumination.",
        "waves.wavelength": "Distance between wave peaks along a prism.",
        "waves.speed": "Travel speed of waves along the prism bands.",

        "mouse.enabled": "Enable the pointer refraction field, lens and pointer halo.",
        "mouse.radius": "Size of the region influenced by the pointer.",
        "mouse.strength": "Strength of the original radial pointer displacement.",
        "mouse.separation": "Strength of colored strand separation around the pointer.",
        "mouse.smoothing": "How quickly the interaction follows the pointer and fades.",
        "mouse.showHalo": "Show subtle illumination behind the pointer interaction.",

        "lens.enabled": "Add a curved optical lens to the pointer field. Requires Mouse enabled.",
        "lens.strength": "Strength of the additional lens curvature.",
        "lens.separation": "Additional radial color separation created by the lens.",
        "lens.ringOpacity": "Brightness of the subtle lens boundary ring.",

        "ripples.enabled": "Click or tap the background to create expanding refractive ripples. Ripples are disabled while animation is paused or reduced motion is active.",
        "ripples.speed": "Outward expansion speed of click ripples.",
        "ripples.width": "Width of the refracting ripple region.",
        "ripples.strength": "How strongly ripples displace rain.",
        "ripples.separation": "Additional spectral separation inside ripple rings.",
        "ripples.lifetime": "Duration of each ripple before it fades.",
        "ripples.opacity": "Brightness of the visible ripple ring.",

        "heroes.enabled": "Allow occasional brighter, longer and wider hero drops.",
        "heroes.chance": "Fraction of drops selected as heroes. Selection refreshes when a drop wraps around the screen.",
        "heroes.brightness": "Brightness multiplier for hero drops.",
        "heroes.length": "Trail length multiplier for hero drops.",
        "heroes.width": "Strand width multiplier for hero drops.",

        "appearance.backgroundColor": "Background RGB color.",
        "appearance.coreColor": "Color of the bright central rain strand and crossing glints.",
        "appearance.colorA": "First original rain color, also used by glass and halos.",
        "appearance.colorB": "Middle original rain color, also used by glass and halos.",
        "appearance.colorC": "Last original rain color, also used by glass and halos.",
        "appearance.glow": "Base halo size, used when Bloom is enabled.",

        "animation.speed": "Speed multiplier for rain, waves, ripples and particles.",
        "animation.paused": "Freeze animation advancement. Settings and pointer interaction remain responsive.",
        "animation.respectReducedMotion": "Freeze animation when the operating system requests reduced motion.",

        "rendering.samples": "Segments along each rain trail. More samples create smoother bends but require more processing.",
        "rendering.pixelRatio": "Maximum rendering pixel ratio. Lower values improve performance; higher values improve sharpness.",

        "panel.enabled": "Hide the editor. Copy your configuration first. Reload to restore it unless disabled in index.html."
    };

    const groupNames = {
        rain: "Rain",
        prisms: "Prism bands",
        spectrum: "Spectral dispersion",
        glass: "Glass ribbons",
        flashes: "Refraction flashes",
        depth: "Depth layers",
        bloom: "Soft bloom",
        waves: "Traveling prism waves",
        mouse: "Mouse interaction",
        lens: "Interactive lens",
        ripples: "Click ripples",
        heroes: "Hero drops",
        appearance: "Appearance",
        animation: "Animation",
        rendering: "Rendering",
        panel: "Editor"
    };

    const title = value => value
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, letter => letter.toUpperCase());

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    const style = document.createElement("style");

    style.textContent = `
        .prism-editor,
        .prism-editor * {
            box-sizing: border-box;
        }

        .prism-editor {
            color: #e8e8f7;
            font: 12px/1.5 system-ui, sans-serif;
            color-scheme: dark;
        }

        .prism-editor [hidden] {
            display: none !important;
        }

        .prism-editor button,
        .prism-editor input,
        .prism-editor textarea {
            font: inherit;
        }

        .prism-editor button {
            padding: 8px 10px;
            border: 1px solid #ffffff26;
            border-radius: 7px;
            background: #242337;
            color: inherit;
            cursor: pointer;
        }

        .prism-editor button:hover {
            background: #37344e;
        }

        .prism-editor :focus-visible {
            outline: 2px solid #b9a7ff;
            outline-offset: 3px;
        }

        .prism-toggle {
            position: fixed;
            top: 16px;
            right: 16px;
            z-index: 1000;
        }

        .prism-panel {
            position: fixed;
            inset: 0 0 0 auto;
            z-index: 1001;
            width: min(350px, 100vw);
            display: flex;
            flex-direction: column;
            border-left: 1px solid #ffffff20;
            background: rgba(12, 12, 24, .97);
            transform: translateX(100%);
            transition: transform 220ms ease;
        }

        .prism-panel.open {
            transform: translateX(0);
        }

        .prism-heading {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 16px;
            border-bottom: 1px solid #ffffff20;
        }

        .prism-heading strong {
            font-size: 16px;
        }

        .prism-body {
            flex: 1;
            min-height: 0;
            overflow-y: auto;
            padding: 0 16px 20px;
        }

        .prism-description {
            color: #aaa8c3;
            font-size: 11px;
        }

        .prism-panel details {
            margin: 12px 0;
            padding: 11px;
            border: 1px solid #ffffff20;
            border-radius: 8px;
        }

        .prism-panel summary {
            color: #c1b5f5;
            font-weight: 600;
            cursor: pointer;
        }

        .prism-panel details[open] > summary {
            margin-bottom: 15px;
        }

        .prism-control {
            margin-bottom: 14px;
        }

        .prism-control:last-child {
            margin-bottom: 0;
        }

        .prism-control-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 6px;
        }

        .prism-control label {
            cursor: help;
        }

        .prism-panel input[type=range] {
            width: 100%;
            margin: 0;
            accent-color: #b5a3ed;
        }

        .prism-panel input[type=number] {
            width: 76px;
            padding: 4px 6px;
            border: 1px solid #ffffff24;
            border-radius: 5px;
            background: #ffffff08;
            color: inherit;
        }

        .prism-panel input[type=checkbox] {
            accent-color: #b5a3ed;
        }

        .prism-colors {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .prism-panel input[type=color] {
            flex: 0 0 40px;
            width: 40px;
            height: 30px;
            padding: 2px;
            border: 1px solid #ffffff24;
            border-radius: 5px;
            background: transparent;
        }

        .prism-colors input[type=number] {
            width: 100%;
            min-width: 0;
        }

        .prism-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 16px;
        }

        .prism-code {
            width: 100%;
            height: 330px;
            margin-top: 14px;
            padding: 10px;
            resize: vertical;
            border: 1px solid #ffffff24;
            border-radius: 7px;
            background: #070711;
            color: #d0c7ed;
            font: 11px/1.5 monospace !important;
            white-space: pre;
        }

        .prism-status {
            min-height: 20px;
            margin-top: 10px;
            color: #b5d8bf;
        }

        .prism-tooltip {
            position: fixed;
            z-index: 1003;
            width: 245px;
            padding: 12px 14px;
            background: rgba(30, 30, 48, .98);
            border: 1px solid #72628f;
            border-radius: 8px;
            color: #e6ddfa;
            box-shadow: 0 8px 24px #0009;
            pointer-events: none;
        }

        @media (prefers-reduced-motion: reduce) {
            .prism-panel {
                transition: none;
            }
        }
    `;

    document.head.append(style);

    const root = document.createElement("div");
    root.className = "prism-editor";
    root.dataset.backgroundEditor = "";

    root.innerHTML = `
        <button
            class="prism-toggle"
            type="button"
            aria-expanded="false"
        >Settings</button>

        <aside
            class="prism-panel"
            aria-label="Prismatic Rain settings"
            inert
        >
            <div class="prism-heading">
                <strong>Prismatic Rain</strong>
                <button class="prism-close" type="button">
                    Retract →
                </button>
            </div>

            <div class="prism-body">
                <p class="prism-description">
                    Click section headings to fold them.
                    Hover over a setting for its description.
                    Click the background to send a refractive ripple.
                </p>

                <div class="prism-controls"></div>

                <div class="prism-actions">
                    <button class="prism-show" type="button">
                        Show code
                    </button>
                    <button class="prism-copy" type="button">
                        Copy config
                    </button>
                    <button class="prism-reset" type="button">
                        New rain
                    </button>
                </div>

                <textarea
                    class="prism-code"
                    aria-label="Configuration code"
                    spellcheck="false"
                    readonly
                    hidden
                ></textarea>

                <div class="prism-status" role="status"></div>

                <p class="prism-description">
                    Paste the copied configuration into index.html
                    to keep your settings.
                </p>
            </div>
        </aside>

        <div class="prism-tooltip" role="tooltip" hidden></div>
    `;

    document.body.append(root);

    const find = selector => root.querySelector(selector);

    const toggle = find(".prism-toggle");
    const panel = find(".prism-panel");
    const close = find(".prism-close");
    const controls = find(".prism-controls");
    const code = find(".prism-code");
    const show = find(".prism-show");
    const status = find(".prism-status");
    const tooltip = find(".prism-tooltip");

    let idCounter = 0;

    function exportCode() {
        return `const config = ${JSON.stringify(config, null, 4)};`;
    }

    function hideHelp() {
        tooltip.hidden = true;
    }

    function showHelp(container, description) {
        tooltip.textContent = description;
        tooltip.hidden = false;

        const panelRect = panel.getBoundingClientRect();
        const rect = container.getBoundingClientRect();
        const w = Math.min(245, Math.max(1, innerWidth - 16));

        tooltip.style.width = w + "px";

        const left = clamp(
            panelRect.left - w - 12,
            8,
            Math.max(8, innerWidth - w - 8)
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
        const result = document.createElement(tag);
        if (className) result.className = className;
        return result;
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
        section.open = groupName === "rain";
        section.append(summary);
        section.addEventListener("toggle", hideHelp);

        for (const [key, value] of Object.entries(group)) {
            const path = `${groupName}.${key}`;
            const description = descriptions[path] || title(key);

            const container = element("div", "prism-control");
            const heading = element("div", "prism-control-title");
            const label = element("label");
            const id = `prism-input-${idCounter++}`;

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
                const row = element("div", "prism-colors");
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
                        parseInt(picker.value.slice(start, start + 2), 16)
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

                        if (input === number) range.value = group[key];
                        else number.value = group[key];

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

    find(".prism-copy").onclick = async () => {
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

    find(".prism-reset").onclick = () => {
        onReset();
        status.textContent = "A new rain pattern has been generated.";
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
    find(".prism-body").addEventListener("scroll", hideHelp);

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
