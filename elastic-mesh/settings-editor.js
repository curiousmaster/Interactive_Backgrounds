"use strict";

export function mountEditor({
    config,
    onChange = () => {},
    onReset = () => {}
}) {
    const limits = {
        "mesh.spacing": [20, 100, 1],
        "mesh.rotation": [-180, 180, 1],
        "mesh.stiffness": [1, 100, 1],
        "mesh.coupling": [0, 100, 1],
        "mesh.damping": [0.5, 20, 0.1],
        "mesh.maxDisplacement": [0, 300, 1],
        "mesh.lineWidth": [0, 4, 0.1],
        "mesh.opacity": [0, 1, 0.01],
        "mesh.dotRadius": [0, 5, 0.1],

        "motion.amplitude": [0, 60, 1],
        "motion.wavelength": [100, 1000, 10],
        "motion.speed": [-2, 2, 0.01],

        "mouse.radius": [30, 500, 1],
        "mouse.strength": [0, 1500, 1],
        "mouse.smoothing": [1, 20, 0.5],

        "shockwaves.strength": [0, 5000, 25],
        "shockwaves.speed": [50, 700, 10],
        "shockwaves.width": [15, 180, 1],
        "shockwaves.lifetime": [0.5, 6, 0.1],
        "shockwaves.ringOpacity": [0, 0.5, 0.005],

        "stress.sensitivity": [0.5, 10, 0.1],
        "stress.intensity": [0, 1, 0.01],

        "energy.speed": [-250, 250, 1],
        "energy.spacing": [100, 1000, 10],
        "energy.width": [10, 150, 1],
        "energy.brightness": [0, 2, 0.01],

        "membrane.opacity": [0, 0.2, 0.005],
        "membrane.stressBoost": [0, 0.3, 0.005],

        "vortex.strength": [-1500, 1500, 10],

        "glints.brightness": [0, 2, 0.01],
        "glints.size": [0.5, 6, 0.1],
        "glints.speed": [0, 5, 0.05],

        "glow.intensity": [0, 1, 0.01],
        "glow.blur": [0, 30, 1],

        "animation.speed": [0, 3, 0.05],
        "rendering.pixelRatio": [0.75, 2, 0.25]
    };

    const choices = {
        "mouse.mode": ["attract", "repel", "vortex"]
    };

    const help = {
        "mesh.spacing": "Distance between mesh nodes. Smaller spacing increases density and processing. Changing this resets the mesh.",
        "mesh.rotation": "Rotation of the grid. Changing this resets the mesh.",
        "mesh.stiffness": "Anchor spring strength. Higher values pull nodes toward their rest positions more firmly.",
        "mesh.coupling": "How strongly neighboring displacements influence each other.",
        "mesh.damping": "How quickly movement loses energy. Lower values create more bounce.",
        "mesh.maxDisplacement": "Maximum distance a node may move from its base position. Changing this resets the mesh.",
        "mesh.lineWidth": "Thickness of mesh connections. Zero hides the lines.",
        "mesh.opacity": "Base brightness of lines, nodes and glints.",
        "mesh.color": "Base RGB color of the mesh.",
        "mesh.showDots": "Show the small node markers. Stress glints have their own toggle.",
        "mesh.dotRadius": "Radius of ordinary node markers.",

        "motion.enabled": "Enable the original ambient moving rest positions.",
        "motion.amplitude": "Scale of ambient displacement. Changing this resets the mesh.",
        "motion.wavelength": "Size of the ambient wave patterns.",
        "motion.speed": "Speed and direction of ambient motion. Zero stops the rest-position animation while springs continue responding.",

        "mouse.enabled": "Enable pointer forces and pointer color highlighting.",
        "mouse.mode": "Attract pulls nodes inward; Repel pushes them outward; Vortex applies a tangential force.",
        "mouse.radius": "Size of the pointer influence region.",
        "mouse.strength": "Strength of the selected pointer force.",
        "mouse.smoothing": "How quickly the pointer field follows movement and fades.",
        "mouse.color": "Color applied near the pointer.",

        "shockwaves.enabled": "Click or tap the background to launch an expanding physical deformation wave.",
        "shockwaves.strength": "Outward acceleration applied by the wave. Maximum stretch still limits node movement.",
        "shockwaves.speed": "Expansion speed of the forcing ring.",
        "shockwaves.width": "Width of the region applying outward force.",
        "shockwaves.lifetime": "Duration of each wave.",
        "shockwaves.showRings": "Show a faint luminous ring marking the wave.",
        "shockwaves.ringOpacity": "Brightness of visible wave rings.",
        "shockwaves.color": "RGB color of wave rings.",

        "stress.enabled": "Color nodes and their connections according to spring length changes.",
        "stress.sensitivity": "How quickly length changes produce strong colors. Also scales membrane highlights and glints.",
        "stress.intensity": "Strength of stress colors.",
        "stress.stretchColor": "Color used when a connection becomes longer than its resting length.",
        "stress.compressionColor": "Color used when a connection becomes shorter than its resting length.",

        "energy.enabled": "Show luminous bands moving along the mesh's grid coordinates. These are visual effects, not extra physical forces.",
        "energy.speed": "Travel speed of energy bands. Negative values reverse direction.",
        "energy.spacing": "Distance between energy bands.",
        "energy.width": "Width of each luminous band.",
        "energy.brightness": "Additional line brightness inside energy bands.",
        "energy.color": "Color of traveling energy bands.",

        "membrane.enabled": "Fill grid cells with faint translucent triangles to reveal the deformed surface.",
        "membrane.opacity": "Base brightness of cell shading.",
        "membrane.stressBoost": "Additional cell brightness where connections stretch or compress.",
        "membrane.color": "Base color of the translucent surface.",

        "vortex.enabled": "Add a tangential force to the selected mouse mode. Requires Mouse enabled.",
        "vortex.strength": "Additional vortex strength. Negative values reverse rotation. In Vortex mouse mode this is added to the main mouse force.",

        "glints.enabled": "Let deformed nodes produce occasional small glints, independently of ordinary node markers.",
        "glints.brightness": "Brightness of stress-driven glints.",
        "glints.size": "Radius of glint cores.",
        "glints.speed": "Speed of glint brightness cycles. Nodes have different phases.",

        "glow.enabled": "Enable soft Gaussian halos around lines, wave rings and glints.",
        "glow.intensity": "Brightness of the halos.",
        "glow.blur": "Width of the halos. Larger values increase pixel processing.",

        "appearance.backgroundColor": "Background RGB color.",

        "animation.speed": "Speed multiplier for spring simulation and visual animations.",
        "animation.paused": "Freeze spring simulation and animated effects. Settings and pointer highlighting remain responsive.",
        "animation.respectReducedMotion": "Freeze animation when the operating system requests reduced motion.",

        "rendering.pixelRatio": "Maximum rendering pixel ratio. Lower values improve performance. Changing this rebuilds the mesh.",

        "panel.enabled": "Hide the editor. Copy your configuration first. Reload restores it unless disabled in index.html."
    };

    const groupNames = {
        mesh: "Mesh",
        motion: "Ambient motion",
        mouse: "Mouse interaction",
        shockwaves: "Click shockwaves",
        stress: "Spring stress colors",
        energy: "Traveling energy",
        membrane: "Cell shading",
        vortex: "Additional pointer vortex",
        glints: "Node glints",
        glow: "Glow",
        appearance: "Appearance",
        animation: "Animation",
        rendering: "Rendering",
        panel: "Settings pane"
    };

    const title = value => value
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, letter => letter.toUpperCase());

    const clamp = (value, min, max) =>
        Math.max(min, Math.min(max, value));

    const style = document.createElement("style");

    style.textContent = `
        .mesh-editor,
        .mesh-editor * {
            box-sizing: border-box;
        }

        .mesh-editor {
            color: #eee;
            font: 12px/1.5 system-ui, sans-serif;
            color-scheme: dark;
        }

        .mesh-editor [hidden] {
            display: none !important;
        }

        .mesh-panel {
            position: fixed;
            inset: 0 0 0 auto;
            width: min(350px, 100vw);
            z-index: 1001;
            display: flex;
            flex-direction: column;
            background: rgba(18, 20, 25, .97);
            border-left: 1px solid #343840;
            box-shadow: -8px 0 30px #0006;
            transform: translateX(100%);
            transition: transform 220ms ease;
        }

        .mesh-panel.open {
            transform: translateX(0);
        }

        .mesh-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            border-bottom: 1px solid #343840;
        }

        .mesh-header strong {
            font-size: 15px;
        }

        .mesh-body {
            flex: 1;
            min-height: 0;
            overflow-y: auto;
            overscroll-behavior: contain;
            padding: 0 16px 20px;
        }

        .mesh-editor details {
            min-width: 0;
            margin: 12px 0;
            padding: 11px;
            border: 1px solid #343840;
            border-radius: 8px;
        }

        .mesh-editor summary {
            color: #aeb8ca;
            font-weight: 600;
            cursor: pointer;
        }

        .mesh-editor details[open] > summary {
            margin-bottom: 15px;
        }

        .mesh-control {
            display: grid;
            grid-template-columns: 1fr 100px;
            gap: 8px;
            align-items: center;
            margin-bottom: 14px;
        }

        .mesh-control:last-child {
            margin-bottom: 0;
        }

        .mesh-control label {
            cursor: help;
        }

        .mesh-editor input[type=range] {
            grid-column: 1 / -1;
            width: 100%;
            margin: 0;
            accent-color: #80baff;
        }

        .mesh-editor input[type=number],
        .mesh-editor select {
            width: 100px;
            padding: 5px 7px;
            color: #fff;
            background: #090b10;
            border: 1px solid #454b57;
            border-radius: 5px;
            font: inherit;
        }

        .mesh-editor input[type=checkbox] {
            justify-self: end;
            accent-color: #80baff;
        }

        .mesh-colors {
            grid-column: 1 / -1;
            display: flex;
            gap: 6px;
            align-items: center;
        }

        .mesh-editor input[type=color] {
            flex: 0 0 40px;
            width: 40px;
            height: 30px;
            padding: 2px;
            background: transparent;
            border: 1px solid #454b57;
            border-radius: 5px;
        }

        .mesh-colors input[type=number] {
            width: 100%;
            min-width: 0;
        }

        .mesh-editor button {
            padding: 8px 11px;
            color: #eee;
            background: #272d38;
            border: 1px solid #454b57;
            border-radius: 6px;
            cursor: pointer;
            font: inherit;
        }

        .mesh-editor button:hover {
            background: #384253;
        }

        .mesh-editor :focus-visible {
            outline: 2px solid #80baff;
            outline-offset: 2px;
        }

        .mesh-launcher {
            position: fixed;
            top: 16px;
            right: 16px;
            z-index: 1000;
        }

        .mesh-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 18px;
        }

        .mesh-editor textarea {
            width: 100%;
            height: 330px;
            margin-top: 12px;
            padding: 10px;
            resize: vertical;
            color: #bce0ff;
            background: #090b10;
            border: 1px solid #454b57;
            border-radius: 6px;
            font: 11px/1.5 monospace;
            white-space: pre;
        }

        .mesh-status {
            min-height: 18px;
            margin-top: 8px;
            color: #a8d6ad;
        }

        .mesh-hint {
            color: #aeb8ca;
            font-size: 11px;
        }

        .mesh-tooltip {
            position: fixed;
            z-index: 1003;
            width: 245px;
            padding: 12px 14px;
            background: rgba(26, 34, 47, .98);
            border: 1px solid #536c8b;
            border-radius: 8px;
            color: #dceaff;
            box-shadow: 0 8px 24px #0009;
            pointer-events: none;
        }

        @media (prefers-reduced-motion: reduce) {
            .mesh-panel {
                transition: none;
            }
        }
    `;

    document.head.append(style);

    const root = document.createElement("div");

    root.className = "mesh-editor";
    root.dataset.backgroundEditor = "";

    root.innerHTML = `
        <button
            class="mesh-launcher"
            type="button"
            aria-expanded="false"
        >Settings</button>

        <aside
            class="mesh-panel"
            aria-label="Elastic Mesh settings"
            inert
        >
            <div class="mesh-header">
                <strong>Elastic Mesh</strong>
                <button class="mesh-close" type="button">
                    Retract →
                </button>
            </div>

            <div class="mesh-body">
                <p class="mesh-hint">
                    Move the pointer to deform the mesh.
                    Click or tap to launch a shockwave.
                    Fold sections by clicking their headings.
                    Hover over settings for descriptions.
                </p>

                <div class="mesh-controls"></div>

                <div class="mesh-actions">
                    <button class="mesh-show" type="button"
                        aria-expanded="false">Show code</button>

                    <button class="mesh-copy" type="button">
                        Copy config
                    </button>

                    <button class="mesh-reset" type="button">
                        Reset mesh
                    </button>
                </div>

                <textarea
                    readonly
                    spellcheck="false"
                    hidden
                    aria-label="Current configuration code"
                ></textarea>

                <div class="mesh-status" role="status"></div>

                <p class="mesh-hint">
                    Paste the copied configuration into index.html
                    to retain your settings.
                    Changes to grid geometry reset the mesh.
                </p>
            </div>
        </aside>

        <div class="mesh-tooltip" role="tooltip" hidden></div>
    `;

    document.body.append(root);

    const find = selector => root.querySelector(selector);

    const panel = find(".mesh-panel");
    const launcher = find(".mesh-launcher");
    const close = find(".mesh-close");
    const controls = find(".mesh-controls");
    const show = find(".mesh-show");
    const code = find("textarea");
    const status = find(".mesh-status");
    const tooltip = find(".mesh-tooltip");

    let controlIndex = 0;

    function getCode() {
        return "const config = " +
            JSON.stringify(config, null, 4) +
            ";";
    }

    function hideHelp() {
        tooltip.hidden = true;
    }

    function showHelp(row, description) {
        tooltip.textContent = description;
        tooltip.hidden = false;

        const panelRect = panel.getBoundingClientRect();
        const rect = row.getBoundingClientRect();
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

        launcher.hidden = open || !config.panel.enabled;
        launcher.setAttribute("aria-expanded", String(open));

        if (open) close.focus();
        else if (config.panel.enabled) launcher.focus();
    }

    function changed(path) {
        onChange(path);
        code.value = getCode();
        status.textContent = "";

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
        section.open = groupName === "mesh";
        section.append(summary);

        section.addEventListener("toggle", hideHelp);

        for (const [key, value] of Object.entries(group)) {
            const path = `${groupName}.${key}`;
            const description = help[path] || title(key);
            const id = `mesh-control-${controlIndex++}`;

            const row = element("div", "mesh-control");
            const label = element("label");

            label.textContent = title(key);
            label.htmlFor = id;
            row.append(label);

            const accessibleHelp = element("span");

            accessibleHelp.id = id + "-help";
            accessibleHelp.hidden = true;
            accessibleHelp.textContent = description;

            row.append(accessibleHelp);

            row.addEventListener("pointerenter", () => {
                showHelp(row, description);
            });

            row.addEventListener("pointerleave", () => {
                if (!row.contains(document.activeElement)) {
                    hideHelp();
                }
            });

            row.addEventListener("focusin", () => {
                showHelp(row, description);
            });

            row.addEventListener("focusout", event => {
                if (!row.contains(event.relatedTarget)) {
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

                row.append(input);

            } else if (choices[path]) {
                const select = element("select");
                select.id = id;

                for (const choice of choices[path]) {
                    const option = element("option");

                    option.value = choice;
                    option.textContent = title(choice);

                    select.append(option);
                }

                select.value = value;

                select.onchange = () => {
                    group[key] = select.value;
                    changed(path);
                };

                row.append(select);

            } else if (Array.isArray(value)) {
                const wrapper = element("div", "mesh-colors");
                const picker = element("input");

                picker.id = id;
                picker.type = "color";
                picker.value = toHex(value);

                wrapper.append(picker);

                const inputs = value.map((channel, index) => {
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

                    wrapper.append(input);
                    return input;
                });

                picker.oninput = () => {
                    group[key] = [1, 3, 5].map(index =>
                        parseInt(
                            picker.value.slice(index, index + 2),
                            16
                        )
                    );

                    inputs.forEach((input, index) => {
                        input.value = group[key][index];
                    });

                    changed(path);
                };

                row.append(wrapper);

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

                row.append(number, range);
            }

            row.querySelectorAll("input, select").forEach(input => {
                input.setAttribute(
                    "aria-describedby",
                    accessibleHelp.id
                );
            });

            section.append(row);
        }

        controls.append(section);
    }

    launcher.onclick = () => setOpen(true);
    close.onclick = () => setOpen(false);

    function showCode(visible) {
        code.hidden = !visible;
        show.textContent = visible ? "Hide code" : "Show code";
        show.setAttribute("aria-expanded", String(visible));
    }

    show.onclick = () => {
        code.value = getCode();
        showCode(code.hidden);
    };

    find(".mesh-copy").onclick = async () => {
        code.value = getCode();

        try {
            await navigator.clipboard.writeText(code.value);
            status.textContent = "Configuration copied.";
        } catch {
            showCode(true);
            code.focus();
            code.select();

            status.textContent =
                "Code selected. Press Ctrl+C or ⌘C to copy.";
        }
    };

    find(".mesh-reset").onclick = () => {
        onReset();
        status.textContent = "Mesh reset.";
    };

    function onKeydown(event) {
        if (
            event.key === "Escape" &&
            panel.classList.contains("open")
        ) {
            setOpen(false);
        }
    }

    document.addEventListener("keydown", onKeydown);
    window.addEventListener("resize", hideHelp);
    find(".mesh-body").addEventListener("scroll", hideHelp);

    code.value = getCode();
    root.hidden = !config.panel.enabled;

    return {
        destroy() {
            document.removeEventListener("keydown", onKeydown);
            window.removeEventListener("resize", hideHelp);

            root.remove();
            style.remove();
        }
    };
}