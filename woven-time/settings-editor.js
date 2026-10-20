"use strict";

export function mountEditor({
    config,
    onChange = () => {},
    onReset = () => {}
}) {
    const clamp = (value, min, max) =>
        Math.max(min, Math.min(max, value));

    // Each field describes:
    // path, label, type/minimum, maximum, step, helper text.
    const groups = [
        ["Fabric", [
            [
                "fabric.spacing", "Thread spacing", 20, 80, 1,
                "Distance between neighboring threads. Smaller values create a denser fabric. Changing this rebuilds the fabric."
            ],
            [
                "fabric.rotation", "Rotation", -180, 180, 1,
                "Rotation of the entire fabric in degrees."
            ],
            [
                "fabric.lineWidth", "Line width", 0, 4, 0.1,
                "Thickness of each thread in CSS pixels."
            ],
            [
                "fabric.opacity", "Opacity", 0, 1, 0.01,
                "Overall thread opacity. Zero hides the fabric; one makes the thread cores solid."
            ],
            [
                "fabric.colorA", "First thread color", "color",
                null, null,
                "RGB color of threads running along the first fabric axis."
            ],
            [
                "fabric.colorB", "Second thread color", "color",
                null, null,
                "RGB color of threads running along the second fabric axis."
            ]
        ]],

        ["Time", [
            [
                "time.speed", "Global speed", -2, 2, 0.01,
                "Shared clock speed. Zero stops clock advancement; negative values reverse it. Pointer synchronization and recovery can still reshape the fabric."
            ],
            [
                "time.variation", "Time variation", 0, 1.5, 0.01,
                "Differences in clock speed between individual thread samples. Higher values make the movement less uniform."
            ],
            [
                "time.pauseStrength", "Local pauses", 0, 1, 0.01,
                "Strength of temporary local slowdowns that travel through the fabric."
            ],
            [
                "time.recovery", "Recovery rate", 0.1, 5, 0.1,
                "How quickly calm patches disappear after the pointer leaves. Also gently brings local clocks toward the shared clock."
            ]
        ]],

        ["Weave", [
            [
                "weave.amplitude", "Fold amplitude", 0, 60, 1,
                "Scale of sideways thread movement. Zero creates straight threads. Changing this rebuilds the fabric."
            ],
            [
                "weave.wavelength", "Wavelength", 100, 700, 10,
                "Length of the main wave along each thread. Larger values produce broader folds."
            ],
            [
                "weave.knotStrength", "Knot strength", 0, 1.5, 0.01,
                "Strength of the smaller, tighter folds layered over the main waves."
            ],
            [
                "weave.knotFrequency", "Knot frequency", 0.1, 2, 0.05,
                "Frequency of regions containing tighter folds."
            ],
            [
                "weave.crossingGap", "Crossing gap", 0, 10, 0.5,
                "Half-width of approximate gaps at alternating crossings. These follow the undeformed grid. Zero draws continuous threads; sampling spacing affects gap precision."
            ]
        ]],

        ["Mouse", [
            [
                "mouse.enabled", "Enabled", "boolean",
                null, null,
                "Enable pointer interaction that synchronizes and calms nearby threads."
            ],
            [
                "mouse.radius", "Synchronization radius", 40, 500, 1,
                "Size of the region affected by the pointer. Influence fades gradually with distance."
            ],
            [
                "mouse.synchronization", "Synchronization rate", 0.1, 12, 0.1,
                "How quickly nearby local clocks align with the shared clock and begin calming."
            ],
            [
                "mouse.calmness", "Calmness", 0, 1, 0.01,
                "How strongly synchronized threads flatten. Zero keeps their movement; one makes the affected area almost straight."
            ],
            [
                "mouse.smoothing", "Response speed", 1, 20, 0.5,
                "How quickly the interaction follows the pointer and fades in or out."
            ],
            [
                "mouse.color", "Synchronized color", "color",
                null, null,
                "Color that nearby threads approach as they synchronize."
            ]
        ]],

        ["Glow", [
            [
                "glow.enabled", "Enabled", "boolean",
                null, null,
                "Enable the soft halo around threads."
            ],
            [
                "glow.intensity", "Intensity", 0, 1, 0.01,
                "Brightness of the halo surrounding the thread cores."
            ],
            [
                "glow.blur", "Blur", 0, 30, 1,
                "Spread of the glow. Larger values create wider halos and increase rendering work."
            ]
        ]],

        ["Rendering", [
            [
                "rendering.sampleSpacing", "Sampling spacing", 4, 20, 1,
                "Distance between simulation samples. Smaller values create finer curves and more precise crossing gaps, but require more processing. Changing this rebuilds the fabric."
            ]
        ]],

        ["Editor", [
            [
                "panel.enabled", "Enable pane", "boolean",
                null, null,
                "Disable to hide the editor. Copy the configuration first. Reload to restore the editor unless panel.enabled is also disabled in index.html."
            ]
        ]]
    ];

    const style = document.createElement("style");

    style.textContent = `
        .woven-editor,
        .woven-editor * {
            box-sizing: border-box;
        }

        .woven-editor {
            color: #eee;
            font: 12px system-ui, sans-serif;
        }

        .woven-editor [hidden] {
            display: none !important;
        }

        .woven-panel {
            position: fixed;
            inset: 0 0 0 auto;
            width: min(350px, 100vw);
            z-index: 1001;
            display: flex;
            flex-direction: column;
            background: rgba(18, 20, 25, .97);
            border-left: 1px solid #343840;
            box-shadow: -8px 0 30px #0008;
            transform: translateX(100%);
            transition: transform .22s ease;
        }

        .woven-panel.open {
            transform: translateX(0);
        }

        .woven-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px;
            border-bottom: 1px solid #343840;
        }

        .woven-header strong {
            font-size: 15px;
        }

        .woven-body {
            flex: 1;
            min-height: 0;
            overflow-y: auto;
            padding: 0 16px 20px;
        }

        .woven-editor details {
            min-width: 0;
            margin: 16px 0;
            padding: 12px;
            border: 1px solid #343840;
            border-radius: 8px;
        }

        .woven-editor summary {
            color: #b9b0dd;
            cursor: pointer;
            font-weight: 600;
            padding: 2px 0;
        }

        .woven-editor details[open] > summary {
            margin-bottom: 16px;
        }

        .woven-editor summary:hover {
            color: #e0d5ff;
        }

        .woven-row {
            display: grid;
            grid-template-columns: 1fr 90px;
            gap: 8px;
            align-items: center;
            margin-bottom: 14px;
        }

        .woven-row:last-child {
            margin-bottom: 0;
        }

        .woven-row label {
            cursor: help;
        }

        .woven-editor input[type=range] {
            grid-column: 1 / -1;
            width: 100%;
            margin: 0;
            accent-color: #bd9cff;
        }

        .woven-editor input[type=number] {
            width: 90px;
            padding: 5px;
            color: #fff;
            background: #090b10;
            border: 1px solid #454b57;
            border-radius: 5px;
        }

        .woven-editor input[type=checkbox] {
            justify-self: end;
            accent-color: #bd9cff;
        }

        .woven-colors {
            grid-column: 1 / -1;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .woven-colors input[type=number] {
            width: 100%;
            min-width: 0;
        }

        .woven-colors input[type=color] {
            flex-shrink: 0;
            width: 40px;
            height: 30px;
            background: transparent;
            border: 1px solid #454b57;
            border-radius: 5px;
        }

        .woven-editor button {
            padding: 8px 10px;
            color: #eee;
            background: #272d38;
            border: 1px solid #454b57;
            border-radius: 6px;
            cursor: pointer;
            font: inherit;
        }

        .woven-editor button:hover {
            background: #384253;
        }

        .woven-editor :focus-visible {
            outline: 2px solid #bd9cff;
            outline-offset: 2px;
        }

        .woven-launcher {
            position: fixed;
            top: 16px;
            right: 16px;
            z-index: 1000;
        }

        .woven-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .woven-editor textarea {
            width: 100%;
            height: 330px;
            margin-top: 12px;
            padding: 10px;
            color: #d2c3ff;
            background: #090b10;
            border: 1px solid #454b57;
            border-radius: 6px;
            font: 11px/1.5 monospace;
            white-space: pre;
            resize: vertical;
        }

        .woven-status {
            min-height: 20px;
            margin-top: 8px;
            color: #b8dabb;
        }

        .woven-hint {
            color: #aeb8ca;
            line-height: 1.5;
        }

        .woven-tooltip {
            position: fixed;
            z-index: 1003;
            width: 245px;
            padding: 12px 14px;
            background: rgba(30, 32, 45, .98);
            border: 1px solid #706288;
            border-radius: 8px;
            color: #e4dcf7;
            font: 12px/1.55 system-ui, sans-serif;
            box-shadow: 0 8px 24px #0009;
            pointer-events: none;
        }

        @media (prefers-reduced-motion: reduce) {
            .woven-panel {
                transition: none;
            }
        }
    `;

    document.head.append(style);

    const root = document.createElement("div");

    root.className = "woven-editor";
    root.setAttribute("data-background-editor", "");

    root.innerHTML = `
        <button
            type="button"
            class="woven-launcher"
            aria-expanded="false"
        >Settings</button>

        <aside
            class="woven-panel"
            aria-label="Woven Time settings"
            inert
        >
            <div class="woven-header">
                <strong>Woven Time</strong>
                <button type="button" class="woven-close">
                    Retract →
                </button>
            </div>

            <div class="woven-body">
                <div class="woven-controls"></div>

                <div class="woven-actions">
                    <button
                        type="button"
                        class="woven-show"
                        aria-expanded="false"
                    >Show code</button>

                    <button type="button" class="woven-copy">
                        Copy config
                    </button>

                    <button type="button" class="woven-reset">
                        Reset fabric
                    </button>
                </div>

                <textarea
                    readonly
                    spellcheck="false"
                    hidden
                    aria-label="Current configuration"
                ></textarea>

                <div class="woven-status" role="status"></div>

                <p class="woven-hint">
                    Move the pointer to synchronize and calm nearby threads.
                    Hover over a setting or focus its input for a description.
                </p>

                <p class="woven-hint">
                    Click a section heading to fold or unfold it.
                    Copy the configuration into index.html to retain changes.
                </p>
            </div>
        </aside>

        <div class="woven-tooltip" role="tooltip" hidden></div>
    `;

    document.body.append(root);

    const find = selector => root.querySelector(selector);

    const panel = find(".woven-panel");
    const launcher = find(".woven-launcher");
    const close = find(".woven-close");
    const controls = find(".woven-controls");
    const show = find(".woven-show");
    const code = find("textarea");
    const status = find(".woven-status");
    const tooltip = find(".woven-tooltip");

    let activeHelpRow = null;
    let controlIndex = 0;

    function get(path) {
        return path.split(".").reduce(
            (object, key) => object[key],
            config
        );
    }

    function set(path, value) {
        const keys = path.split(".");
        const last = keys.pop();

        const object = keys.reduce(
            (object, key) => object[key],
            config
        );

        object[last] = value;
    }

    function exportCode() {
        return "const config = " +
            JSON.stringify(config, null, 4) +
            ";";
    }

    function refresh() {
        code.value = exportCode();
        status.textContent = "";
    }

    function hideHelp() {
        tooltip.hidden = true;
        activeHelpRow = null;
    }

    function positionHelp() {
        if (!activeHelpRow || tooltip.hidden) return;

        const panelRect = panel.getBoundingClientRect();
        const rowRect = activeHelpRow.getBoundingClientRect();

        const tooltipWidth = Math.min(
            245,
            Math.max(1, window.innerWidth - 16)
        );

        tooltip.style.width = tooltipWidth + "px";

        const tooltipHeight = tooltip.offsetHeight;

        // Prefer the left side of the settings panel.
        // On narrow screens place the description within the viewport.
        const left = clamp(
            panelRect.left - tooltipWidth - 12,
            8,
            Math.max(8, window.innerWidth - tooltipWidth - 8)
        );

        const top = clamp(
            rowRect.top,
            8,
            Math.max(8, window.innerHeight - tooltipHeight - 8)
        );

        tooltip.style.left = left + "px";
        tooltip.style.top = top + "px";
    }

    function showHelp(row, description) {
        activeHelpRow = row;
        tooltip.textContent = description;
        tooltip.hidden = false;
        positionHelp();
    }

    function setOpen(open) {
        open = Boolean(open && config.panel.enabled);

        hideHelp();

        panel.classList.toggle("open", open);
        panel.inert = !open;

        launcher.hidden = open || !config.panel.enabled;
        launcher.setAttribute("aria-expanded", String(open));

        if (open) {
            close.focus();
        } else if (config.panel.enabled) {
            launcher.focus();
        }
    }

    function changed(path) {
        onChange(path);
        refresh();

        if (path === "panel.enabled") {
            if (!config.panel.enabled) {
                setOpen(false);
            }

            root.hidden = !config.panel.enabled;
        }
    }

    function showCode(visible) {
        code.hidden = !visible;
        show.textContent = visible ? "Hide code" : "Show code";
        show.setAttribute("aria-expanded", String(visible));
    }

    function hex(color) {
        return "#" + color.map(value =>
            Math.round(clamp(value, 0, 255))
                .toString(16)
                .padStart(2, "0")
        ).join("");
    }

    launcher.onclick = () => setOpen(true);
    close.onclick = () => setOpen(false);

    show.onclick = () => {
        refresh();
        showCode(code.hidden);
    };

    find(".woven-copy").onclick = async () => {
        refresh();

        try {
            await navigator.clipboard.writeText(exportCode());
            status.textContent = "Configuration copied.";
        } catch {
            showCode(true);
            code.focus();
            code.select();

            status.textContent = "Press Ctrl+C or ⌘C to copy.";
        }
    };

    find(".woven-reset").onclick = () => {
        onReset();
        status.textContent = "Fabric reset.";
    };

    function keydown(event) {
        if (
            event.key === "Escape" &&
            panel.classList.contains("open")
        ) {
            setOpen(false);
        }
    }

    document.addEventListener("keydown", keydown);
    window.addEventListener("resize", hideHelp);

    find(".woven-body").addEventListener("scroll", hideHelp);

    for (const [groupTitle, fields] of groups) {
        const section = document.createElement("details");
        const summary = document.createElement("summary");

        section.open = true;
        summary.textContent = groupTitle;

        section.append(summary);
        section.addEventListener("toggle", hideHelp);

        for (const [
            path,
            title,
            type,
            max,
            step,
            description
        ] of fields) {
            const row = document.createElement("div");
            row.className = "woven-row";

            const label = document.createElement("label");
            const id = `woven-control-${controlIndex++}`;

            label.textContent = title;
            label.htmlFor = id;

            row.append(label);

            // A hidden description also makes the help available
            // to assistive technology without relying on hover.
            const accessibleHelp = document.createElement("span");

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

            if (type === "boolean") {
                const input = document.createElement("input");

                input.id = id;
                input.type = "checkbox";
                input.checked = get(path);

                input.onchange = () => {
                    set(path, input.checked);
                    changed(path);
                };

                row.append(input);
            } else if (type === "color") {
                const wrapper = document.createElement("div");
                wrapper.className = "woven-colors";

                const picker = document.createElement("input");

                picker.id = id;
                picker.type = "color";
                picker.value = hex(get(path));

                wrapper.append(picker);

                const inputs = ["R", "G", "B"].map((channel, i) => {
                    const input = document.createElement("input");

                    input.type = "number";
                    input.min = 0;
                    input.max = 255;
                    input.step = 1;
                    input.value = get(path)[i];

                    input.setAttribute(
                        "aria-label",
                        `${title} ${channel}`
                    );

                    input.oninput = () => {
                        const value = input.valueAsNumber;
                        if (!Number.isFinite(value)) return;

                        const color = [...get(path)];

                        color[i] = Math.round(
                            clamp(value, 0, 255)
                        );

                        set(path, color);
                        picker.value = hex(color);
                        changed(path);
                    };

                    input.onchange = () => {
                        input.value = get(path)[i];
                    };

                    wrapper.append(input);
                    return input;
                });

                picker.oninput = () => {
                    const color = [1, 3, 5].map(i =>
                        parseInt(picker.value.slice(i, i + 2), 16)
                    );

                    set(path, color);

                    inputs.forEach((input, i) => {
                        input.value = color[i];
                    });

                    changed(path);
                };

                row.append(wrapper);
            } else {
                const number = document.createElement("input");
                const range = document.createElement("input");

                number.id = id;
                number.type = "number";
                range.type = "range";
                range.setAttribute("aria-label", title);

                for (const input of [number, range]) {
                    input.min = type;
                    input.max = max;
                    input.step = step;
                    input.value = get(path);
                }

                function update(source, target) {
                    let value = source.valueAsNumber;

                    if (!Number.isFinite(value)) return;

                    value = clamp(value, type, max);

                    if (step === 1) {
                        value = Math.round(value);
                    }

                    set(path, value);
                    target.value = value;
                    changed(path);
                }

                number.oninput = () => update(number, range);
                range.oninput = () => update(range, number);

                number.onchange = () => {
                    number.value = get(path);
                };

                row.append(number, range);
            }

            row.querySelectorAll("input").forEach(input => {
                input.setAttribute(
                    "aria-describedby",
                    accessibleHelp.id
                );
            });

            section.append(row);
        }

        controls.append(section);
    }

    refresh();
    root.hidden = !config.panel.enabled;

    return {
        destroy() {
            document.removeEventListener("keydown", keydown);
            window.removeEventListener("resize", hideHelp);

            root.remove();
            style.remove();
        }
    };
}
