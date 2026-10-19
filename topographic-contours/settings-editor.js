
"use strict";

export function mountEditor({
    config,
    onChange = () => {}
}) {
    // ==================================================
    // Helpers
    // ==================================================

    const clamp = (value, min, max) =>
        Math.max(min, Math.min(max, value));

    const getValue = path =>
        path.split(".").reduce(
            (object, key) => object[key],
            config
        );

    function setValue(path, value) {
        const keys = path.split(".");
        const last = keys.pop();

        const object = keys.reduce(
            (current, key) => current[key],
            config
        );

        object[last] = value;

        onChange(path);
        refreshCode();

        if (
            path === "panel.enabled" &&
            !config.panel.enabled
        ) {
            setOpen(false);
            root.hidden = true;
        }
    }

    function getCode() {
        return "const config = " +
            JSON.stringify(config, null, 4) +
            ";";
    }

    function toHex(color) {
        return "#" + color.map(value =>
            Math.round(clamp(value, 0, 255))
                .toString(16)
                .padStart(2, "0")
        ).join("");
    }

    function fromHex(hex) {
        return [1, 3, 5].map(index =>
            parseInt(
                hex.slice(index, index + 2),
                16
            )
        );
    }

    // ==================================================
    // Setting definitions
    // ==================================================

    const groups = [
        ["Terrain", [
            [
                "terrain.scale",
                "Feature scale",
                60, 600, 1,
                "Controls the size of terrain features. " +
                "Higher values produce wider hills and valleys."
            ],
            [
                "terrain.amplitude",
                "Elevation",
                0, 2, 0.05,
                "Controls the overall elevation amplitude."
            ],
            [
                "terrain.speed",
                "Evolution speed",
                -1, 1, 0.01,
                "Controls terrain animation speed. " +
                "Negative values reverse the animation."
            ],
            [
                "terrain.detail",
                "Detail",
                0, 1, 0.01,
                "Adds smaller variations to the terrain."
            ],
            [
                "terrain.rotation",
                "Rotation",
                -180, 180, 1,
                "Rotates the terrain field in degrees."
            ]
        ]],

        ["Contour lines", [
            [
                "contours.interval",
                "Elevation interval",
                0.04, 0.5, 0.01,
                "Elevation difference between contour lines. " +
                "Smaller values produce more lines."
            ],
            [
                "contours.lineWidth",
                "Line width",
                0, 4, 0.1,
                "Width of ordinary contour lines."
            ],
            [
                "contours.opacity",
                "Opacity",
                0, 1, 0.01,
                "Controls the visibility of contour lines."
            ],
            [
                "contours.color",
                "Line color",
                "color", null, null,
                "Original contour color, used when " +
                "elevation coloring is disabled or blended."
            ],
            [
                "contours.majorEvery",
                "Major line every",
                1, 10, 1,
                "Emphasizes every Nth contour line."
            ],
            [
                "contours.majorWidth",
                "Major line width",
                0, 6, 0.1,
                "Width of emphasized contour lines."
            ]
        ]],

        ["Elevation colors", [
            [
                "elevationColors.theme",
                "Color theme",
                "select",
                [
                    "ocean",
                    "terrain",
                    "lava",
                    "aurora",
                    "monochrome"
                ],
                null,
                "Select one of five predefined elevation " +
                "color palettes, ordered from low to high."
            ],
            [
                "elevationColors.coloredLines",
                "Colored contour lines",
                "boolean", null, null,
                "Color individual contour lines according " +
                "to their elevation."
            ],
            [
                "elevationColors.filledBands",
                "Filled elevation bands",
                "boolean", null, null,
                "Fill the regions between contour lines " +
                "with elevation-dependent colors."
            ],
            [
                "elevationColors.bandOpacity",
                "Band opacity",
                0, 1, 0.01,
                "Controls the opacity of the colored " +
                "elevation bands. Zero leaves a black background."
            ],
            [
                "elevationColors.lineBlend",
                "Line color blending",
                0, 1, 0.01,
                "Zero uses the original contour color. " +
                "One uses the elevation palette color. " +
                "Intermediate values blend both."
            ],
            [
                "elevationColors.smoothBands",
                "Smooth color gradient",
                "boolean", null, null,
                "When disabled, areas between contour lines " +
                "have distinct colors. When enabled, colors " +
                "transition continuously with elevation."
            ],
            [
                "elevationColors.range",
                "Palette elevation range",
                0.1, 5, 0.05,
                "Controls the elevation range represented " +
                "by the complete color palette."
            ],
            [
                "elevationColors.offset",
                "Palette elevation offset",
                -3, 3, 0.05,
                "Moves the color palette up or down " +
                "relative to the terrain elevation."
            ]
        ]],

        ["Mouse", [
            [
                "mouse.enabled",
                "Enabled",
                "boolean", null, null,
                "Enables mouse-controlled terrain deformation."
            ],
            [
                "mouse.mode",
                "Mode",
                "select",
                ["hill", "depression"],
                null,
                "Hill raises terrain beneath the pointer. " +
                "Depression lowers it."
            ],
            [
                "mouse.radius",
                "Influence radius",
                30, 500, 1,
                "Radius of the mouse influence in pixels."
            ],
            [
                "mouse.strength",
                "Elevation strength",
                0, 2, 0.05,
                "Controls the elevation change caused " +
                "by the mouse."
            ],
            [
                "mouse.smoothing",
                "Response speed",
                1, 20, 0.5,
                "Higher values make the terrain respond " +
                "more quickly to pointer movement."
            ],
            [
                "mouse.color",
                "Mouse color",
                "color", null, null,
                "Color tint applied to contours near " +
                "the mouse pointer."
            ]
        ]],

        ["Glow", [
            [
                "glow.enabled",
                "Enabled",
                "boolean", null, null,
                "Enables the soft glow surrounding " +
                "contour lines."
            ],
            [
                "glow.intensity",
                "Intensity",
                0, 1, 0.01,
                "Controls the brightness of contour glow."
            ],
            [
                "glow.blur",
                "Blur",
                0, 30, 1,
                "Controls the approximate radius " +
                "of the glow effect."
            ]
        ]],

        ["Rendering", [
            [
                "resolution",
                "Sampling spacing",
                8, 32, 1,
                "Controls GPU rendering quality. " +
                "Higher values reduce rendering resolution " +
                "and improve performance."
            ]
        ]],

        ["Settings pane", [
            [
                "panel.enabled",
                "Enable pane",
                "boolean", null, null,
                "Enables or disables the settings interface. " +
                "Copy your configuration before disabling it."
            ]
        ]]
    ];

    // ==================================================
    // Editor DOM
    // ==================================================

    const root = document.createElement("div");

    root.className = "topo-editor";

    root.setAttribute(
        "data-background-editor",
        ""
    );

    root.innerHTML = `
        <button
            class="topo-launcher"
            type="button"
            aria-expanded="false"
        >
            Settings
        </button>

        <aside
            class="topo-panel"
            aria-label="Topographic settings"
            inert
        >
            <div class="topo-header">
                <strong>
                    Topographic contours
                </strong>

                <button
                    class="topo-close"
                    type="button"
                >
                    Retract →
                </button>
            </div>

            <div class="topo-body">
                <div class="topo-controls"></div>

                <div class="topo-actions">
                    <button
                        class="topo-show"
                        type="button"
                        aria-expanded="false"
                    >
                        Show code
                    </button>

                    <button
                        class="topo-copy"
                        type="button"
                    >
                        Copy config
                    </button>
                </div>

                <textarea
                    readonly
                    spellcheck="false"
                    hidden
                    aria-label="Current configuration code"
                ></textarea>

                <div
                    class="topo-status"
                    role="status"
                ></div>

                <p class="topo-hint">
                    All changes apply immediately.
                    Copy the configuration into index.html
                    to save the settings permanently.
                </p>

                <p class="topo-hint">
                    Elevation colors can be applied to
                    contour lines, filled regions, or both.
                    Both features can be disabled independently.
                </p>

                <p class="topo-hint">
                    Hover over a setting for a description.
                    Click a section heading to collapse
                    or expand its controls.
                </p>
            </div>
        </aside>

        <div
            class="topo-tooltip"
            role="tooltip"
        ></div>
    `;

    document.body.appendChild(root);

    const find = selector =>
        root.querySelector(selector);

    const panel = find(".topo-panel");
    const launcher = find(".topo-launcher");
    const close = find(".topo-close");
    const controls = find(".topo-controls");
    const show = find(".topo-show");
    const copy = find(".topo-copy");
    const code = find("textarea");
    const status = find(".topo-status");
    const tooltip = find(".topo-tooltip");

    // ==================================================
    // Code export
    // ==================================================

    function refreshCode() {
        code.value = getCode();
        status.textContent = "";
    }

    function setCodeVisible(visible) {
        code.hidden = !visible;

        show.textContent = visible
            ? "Hide code"
            : "Show code";

        show.setAttribute(
            "aria-expanded",
            String(visible)
        );
    }

    // ==================================================
    // Panel controls
    // ==================================================

    function setOpen(open) {
        open = Boolean(
            open && config.panel.enabled
        );

        panel.classList.toggle("open", open);
        panel.inert = !open;

        launcher.hidden =
            open || !config.panel.enabled;

        launcher.setAttribute(
            "aria-expanded",
            String(open)
        );

        hideTooltip();

        if (open) {
            close.focus();
        } else if (config.panel.enabled) {
            launcher.focus();
        }
    }

    launcher.addEventListener(
        "click",
        () => setOpen(true)
    );

    close.addEventListener(
        "click",
        () => setOpen(false)
    );

    function onKeydown(event) {
        if (
            event.key === "Escape" &&
            panel.classList.contains("open")
        ) {
            setOpen(false);
        }
    }

    document.addEventListener(
        "keydown",
        onKeydown
    );

    // ==================================================
    // Hover descriptions
    // ==================================================

    function hideTooltip() {
        tooltip.classList.remove("visible");
    }

    function showTooltip(row, description) {
        if (!description) return;

        tooltip.textContent = description;

        tooltip.classList.add("visible");

        const rect = row.getBoundingClientRect();

        const tooltipWidth = tooltip.offsetWidth;
        const tooltipHeight = tooltip.offsetHeight;

        let left = rect.left -
            tooltipWidth - 12;

        if (left < 8) {
            left = Math.max(
                8,
                rect.right + 12
            );
        }

        tooltip.style.left = left + "px";

        tooltip.style.top = clamp(
            rect.top,
            8,
            Math.max(
                8,
                window.innerHeight -
                tooltipHeight - 8
            )
        ) + "px";
    }

    // ==================================================
    // Build configuration controls
    // ==================================================

    let controlIndex = 0;

    for (const [title, fields] of groups) {
        const details =
            document.createElement("details");

        details.open =
            title !== "Settings pane";

        const summary =
            document.createElement("summary");

        summary.textContent = title;

        const fieldBox =
            document.createElement("div");

        fieldBox.className = "topo-fields";

        details.append(
            summary,
            fieldBox
        );

        for (
            const [
                path,
                labelText,
                typeOrMin,
                max,
                step,
                description
            ] of fields
        ) {
            const row =
                document.createElement("div");

            const label =
                document.createElement("label");

            const id =
                `topo-control-${controlIndex++}`;

            row.className = "topo-control";

            label.textContent = labelText;
            label.htmlFor = id;

            row.appendChild(label);

            // --------------------------------------
            // Tooltip events
            // --------------------------------------

            row.addEventListener(
                "pointerenter",
                () => showTooltip(
                    row,
                    description
                )
            );

            row.addEventListener(
                "pointerleave",
                hideTooltip
            );

            row.addEventListener(
                "focusin",
                () => showTooltip(
                    row,
                    description
                )
            );

            row.addEventListener(
                "focusout",
                hideTooltip
            );

            // --------------------------------------
            // Boolean controls
            // --------------------------------------

            if (typeOrMin === "boolean") {
                const input =
                    document.createElement("input");

                input.id = id;
                input.type = "checkbox";
                input.checked = getValue(path);

                input.addEventListener(
                    "change",
                    () => {
                        setValue(
                            path,
                            input.checked
                        );
                    }
                );

                row.appendChild(input);
            }

            // --------------------------------------
            // Select controls
            // --------------------------------------

            else if (typeOrMin === "select") {
                const select =
                    document.createElement("select");

                select.id = id;

                for (const value of max) {
                    const option =
                        document.createElement("option");

                    option.value = value;

                    option.textContent =
                        value.charAt(0).toUpperCase() +
                        value.slice(1);

                    select.appendChild(option);
                }

                select.value = getValue(path);

                select.addEventListener(
                    "change",
                    () => {
                        setValue(
                            path,
                            select.value
                        );
                    }
                );

                row.appendChild(select);
            }

            // --------------------------------------
            // Color controls
            // --------------------------------------

            else if (typeOrMin === "color") {
                const wrapper =
                    document.createElement("div");

                const picker =
                    document.createElement("input");

                const rgbWrapper =
                    document.createElement("div");

                wrapper.className = "topo-colors";
                rgbWrapper.className = "topo-rgb";

                picker.id = id;
                picker.type = "color";
                picker.value = toHex(
                    getValue(path)
                );

                const inputs = [
                    "R",
                    "G",
                    "B"
                ].map((channel, index) => {
                    const input =
                        document.createElement("input");

                    input.type = "number";
                    input.min = 0;
                    input.max = 255;
                    input.step = 1;

                    input.value =
                        getValue(path)[index];

                    input.setAttribute(
                        "aria-label",
                        `${labelText} ${channel}`
                    );

                    input.addEventListener(
                        "input",
                        () => {
                            const value =
                                input.valueAsNumber;

                            if (
                                !Number.isFinite(value)
                            ) {
                                return;
                            }

                            const color = [
                                ...getValue(path)
                            ];

                            color[index] = Math.round(
                                clamp(value, 0, 255)
                            );

                            picker.value = toHex(color);

                            setValue(path, color);
                        }
                    );

                    input.addEventListener(
                        "change",
                        () => {
                            input.value =
                                getValue(path)[index];
                        }
                    );

                    rgbWrapper.appendChild(input);

                    return input;
                });

                picker.addEventListener(
                    "input",
                    () => {
                        const color = fromHex(
                            picker.value
                        );

                        inputs.forEach(
                            (input, index) => {
                                input.value = color[index];
                            }
                        );

                        setValue(path, color);
                    }
                );

                wrapper.append(
                    picker,
                    rgbWrapper
                );

                row.appendChild(wrapper);
            }

            // --------------------------------------
            // Numeric controls
            // --------------------------------------

            else {
                const number =
                    document.createElement("input");

                const range =
                    document.createElement("input");

                number.id = id;
                number.type = "number";
                range.type = "range";

                range.setAttribute(
                    "aria-label",
                    labelText
                );

                for (const input of [
                    number,
                    range
                ]) {
                    input.min = typeOrMin;
                    input.max = max;
                    input.step = step;
                    input.value = getValue(path);
                }

                function update(source, target) {
                    let value =
                        source.valueAsNumber;

                    if (
                        !Number.isFinite(value)
                    ) {
                        return;
                    }

                    value = clamp(
                        value,
                        typeOrMin,
                        max
                    );

                    if (step === 1) {
                        value = Math.round(value);
                    }

                    target.value = value;

                    setValue(path, value);
                }

                number.addEventListener(
                    "input",
                    () => update(
                        number,
                        range
                    )
                );

                number.addEventListener(
                    "change",
                    () => {
                        number.value = getValue(path);
                    }
                );

                range.addEventListener(
                    "input",
                    () => update(
                        range,
                        number
                    )
                );

                row.append(
                    number,
                    range
                );
            }

            fieldBox.appendChild(row);
        }

        controls.appendChild(details);
    }

    // ==================================================
    // Export actions
    // ==================================================

    show.addEventListener(
        "click",
        () => {
            refreshCode();
            setCodeVisible(code.hidden);
        }
    );

    copy.addEventListener(
        "click",
        async () => {
            refreshCode();

            try {
                await navigator.clipboard.writeText(
                    getCode()
                );

                status.textContent =
                    "Configuration copied.";
            } catch {
                setCodeVisible(true);

                code.focus();
                code.select();

                status.textContent =
                    "Code selected. Press Ctrl+C to copy.";
            }
        }
    );

    // ==================================================
    // Initialize
    // ==================================================

    refreshCode();

    root.hidden = !config.panel.enabled;

    // ==================================================
    // Cleanup
    // ==================================================

    return {
        destroy() {
            document.removeEventListener(
                "keydown",
                onKeydown
            );

            root.remove();
        }
    };
}
