'use strict';

window.MidnightMazeSettings = function ({ config, defaults, presets, onChange, onGenerate }) {
  function merge(target, source) {
    for (const [key, value] of Object.entries(source)) {
      if (value && typeof value === 'object') merge(target[key], value);
      else target[key] = value;
    }
  }

  function element(tag, text = '', parent = null) {
    const node = document.createElement(tag);
    node.textContent = text;
    parent?.append(node);
    return node;
  }

  const css = element('style', `
    #maze-settings {
      position: fixed; z-index: 10; top: .75rem; right: .75rem; color: #edf3ff;
      font: 14px/1.45 system-ui, sans-serif; color-scheme: dark;
    }
    #maze-settings button, #maze-settings input, #maze-settings select {
      font: inherit; accent-color: #8db5ff;
    }
    #maze-settings button, #maze-settings select, #maze-settings input[type=search] {
      color: inherit; background: #192640; border: 1px solid #49638a;
      border-radius: .4rem; padding: .35rem .55rem;
    }
    #maze-settings button { cursor: pointer; }
    #maze-settings > button { display: block; margin-left: auto; }
    #maze-settings .panel {
      box-sizing: border-box; width: min(22rem, calc(100vw - 1.5rem));
      max-height: calc(100dvh - 4rem); overflow: auto; margin-top: .5rem;
      padding: .8rem; background: #0b1324f5; border: 1px solid #395079;
      border-radius: .65rem;
    }
    #maze-settings h2 { margin: 0 0 .6rem; font-size: 1.1rem; }
    #maze-settings details { border-top: 1px solid #314260; padding: .45rem 0; }
    #maze-settings summary { font-weight: 650; cursor: pointer; }
    #maze-settings label { display: block; margin: .45rem 0; }
    #maze-settings label span { display: block; }
    #maze-settings input[type=range], #maze-settings input[type=search] {
      box-sizing: border-box; width: 100%;
    }
    #maze-settings output { float: right; color: #a8c4ef; }
    #maze-settings .actions { display: flex; gap: .4rem; flex-wrap: wrap; margin-top: .7rem; }
    #maze-settings .help {
      position: fixed; right: min(23.4rem, 65vw); width: min(15rem, 31vw);
      background: #0b1324; border: 1px solid #395079; border-radius: .4rem;
      padding: .5rem; pointer-events: none; overflow-wrap: anywhere;
    }
    @media (max-width: 600px) {
      #maze-settings .help { right: .85rem; top: auto !important; bottom: .85rem; width: min(19rem, 80vw); }
    }
  `, document.head);
  css.id = 'maze-settings-css';

  const root = element('aside', '', document.body);
  root.id = 'maze-settings';
  const toggle = element('button', 'Maze settings', root);
  const panel = element('div', '', root);
  panel.id = 'maze-settings-panel';
  panel.className = 'panel';
  panel.hidden = true;
  toggle.setAttribute('aria-controls', panel.id);
  toggle.setAttribute('aria-expanded', 'false');
  const help = element('div', '', root);
  help.className = 'help';
  help.hidden = true;
  help.setAttribute('aria-hidden', 'true');

  toggle.onclick = () => {
    panel.hidden = !panel.hidden;
    toggle.setAttribute('aria-expanded', String(!panel.hidden));
    help.hidden = true;
    if (!panel.hidden) search.focus();
  };
  root.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    help.hidden = true;
    toggle.focus();
  });

  element('h2', 'Midnight Maze', panel);
  const search = element('input', '', panel);
  search.type = 'search';
  search.placeholder = 'Find a setting…';
  search.setAttribute('aria-label', 'Find a setting');
  const presetLabel = element('label', 'Preset ', panel);
  const preset = element('select', '', presetLabel);
  for (const name of Object.keys(presets)) element('option', name, preset);
  element('option', 'Custom', preset).disabled = true;
  preset.onchange = () => {
    const { panX, panY, zoom } = config.view;
    const camera = { ...config.camera };
    const input = { ...config.input };
    const maze = { ...config.maze };
    const { glass } = config.style;
    const { pacmen, ghosts } = config.chase;
    merge(config, defaults);
    merge(config, presets[preset.value]);
    Object.assign(config.view, { panX, panY, zoom });
    Object.assign(config.camera, camera);
    Object.assign(config.input, input);
    Object.assign(config.maze, maze);
    config.style.glass = glass;
    Object.assign(config.chase, { pacmen, ghosts });
    refresh();
  };

  const rows = [];
  const sections = [];
  function section(title, parent = panel, visible = () => true) {
    const details = element('details', '', parent);
    element('summary', title, details);
    sections.push({ details, visible, title, open: false });
    return details;
  }

  function control(parent, target, key, name, description, options = {}) {
    const { type = 'range', min, max, step, choices, visible = () => true } = options;
    const row = element('label', '', parent);
    const caption = element('span', name, row);
    const input = element(choices ? 'select' : 'input', '', row);
    const output = type === 'range' && !choices ? element('output', '', caption) : null;
    if (choices) {
      for (const choice of choices) element('option', choice, input);
    } else {
      input.type = type;
      if (type === 'range') Object.assign(input, { min, max, step });
    }
    input.setAttribute('aria-label', name);
    input.title = description;
    const showHelp = () => {
      help.textContent = description;
      help.style.top = Math.min(row.getBoundingClientRect().top, window.innerHeight - 100) + 'px';
      help.hidden = false;
    };
    row.addEventListener('mouseenter', showHelp);
    row.addEventListener('mouseleave', () => { help.hidden = true; });
    input.addEventListener('focus', showHelp);
    input.addEventListener('blur', () => { help.hidden = true; });
    input.oninput = () => {
      target[key] = type === 'checkbox' ? input.checked :
        output ? input.valueAsNumber : input.value;
      options.onInput?.();
      preset.value = 'Custom';
      refresh();
    };
    rows.push({
      row, visible, query: (name + ' ' + description).toLowerCase(),
      sync() {
        if (type === 'checkbox') input.checked = target[key];
        else input.value = target[key];
        if (output) output.textContent = target[key];
      }
    });
  }

  const range = (parent, target, key, name, min, max, step, description, visible) =>
    control(parent, target, key, name, description, { min, max, step, visible });
  const check = (parent, target, key, name, description) =>
    control(parent, target, key, name, description, { type: 'checkbox' });

  const chase = section('Chase');
  range(chase, config.chase, 'pacmen', 'Pac-Man count', 1, 4, 1, 'Number of pellet hunters.');
  range(chase, config.chase, 'ghosts', 'Ghost count', 0, 12, 1, 'Number of ghosts. Set zero for a quiet pellet loop.');
  range(chase, config.chase, 'speed', 'Chase speed', 1, 8, .1, 'Base movement in maze cells per second.');
  range(chase, config.chase, 'refill', 'Pellet refill', 2, 45, 1, 'Seconds before cleared pellets begin to regrow.');
  range(chase, config.chase, 'power', 'Power duration', 2, 18, .5, 'Seconds ghosts spend fleeing Pac-Man.');

  const view = section('View');
  control(view, config.view, 'mode', 'View mode', 'Switch projections while the chase keeps running.', { choices: ['2D', '3D'] });

  for (const [mode, target] of [['2D', config.view], ['3D', config.camera]]) {
    const camera = section(mode + ' camera', panel, () => config.view.mode === mode);
    range(camera, target, 'zoom', 'Zoom', mode === '2D' ? 1 : .65, 3, .05, 'Scale relative to the fitted board.');
    const pan = () => mode === '3D' || target.zoom > 1;
    range(camera, target, 'panX', 'Horizontal pan', -10, 10, .1, 'Move the camera target along the maze X axis.', pan);
    range(camera, target, 'panY', 'Vertical pan', -8, 8, .1, 'Move the camera target along the maze Z axis.', pan);
    if (mode === '3D') {
      range(camera, target, 'tilt', 'Tilt', 1, 70, 1, 'Degrees away from directly overhead.');
      range(camera, target, 'rotation', 'Rotation', -180, 180, 1, 'Rotate the view around the maze.');
      range(camera, target, 'fov', 'Field of view', 20, 75, 1, 'Vertical perspective field of view in degrees.');
    }
    const reset = element('button', 'Reset ' + mode + ' camera', camera);
    reset.onclick = () => {
      const current = config.view.mode;
      merge(target, mode === '2D' ? defaults.view : defaults.camera);
      config.view.mode = current;
      preset.value = 'Custom';
      refresh();
    };
  }

  const style = section('Appearance');
  for (const [key, name] of [['background', 'Background color'], ['wall', 'Wall color']]) {
    control(style, config.style, key, name, 'Base color before the chase lighting is applied.', { type: 'color' });
  }
  range(style, config.style, 'brightness', 'Brightness', .15, 1.4, .01, 'Global brightness of walls, actors, and pellets.');
  const maze = section('Maze');
  control(maze, config.maze, 'layout', 'Starting layout', 'Choose the original board or a procedurally generated maze.', {
    choices: ['Classic', 'Random'],
    onInput() { if (config.maze.layout === 'Classic') config.maze.size = 21; }
  });
  control(maze, config.maze, 'size', 'Maze size', 'Board width in tiles. Height is six tiles fewer. Resizing switches to Random.', {
    min: 15, max: 35, step: 2,
    onInput() { config.maze.layout = 'Random'; }
  });
  const generate = element('button', 'Generate new maze', maze);
  generate.onclick = () => {
    const wasRandom = config.maze.layout === 'Random';
    config.maze.layout = 'Random';
    preset.value = 'Custom';
    refresh();
    if (wasRandom) onGenerate();
  };
  range(maze, config.style, 'glass', 'Wall opacity', 0, 1, .01, 'Fade the entire wall in 2D or 3D. Set zero to hide walls.');
  range(maze, config.maze, 'wallHeight', 'Wall height', .1, 2.5, .01, 'Wall height in maze tiles.', () => config.view.mode === '3D');
  check(maze, config.maze, 'autoGenerate', 'Automatically generate mazes', 'Replace the board at a regular interval.');
  range(maze, config.maze, 'generateEvery', 'New maze interval', 10, 300, 1,
    'Seconds between new random boards.', () => config.maze.autoGenerate);
  check(maze, config.maze, 'shifting', 'Shifting walls', 'Periodically open one corridor and close another without splitting the maze.');
  range(maze, config.maze, 'shiftEvery', 'Wall shift interval', 2, 60, .5,
    'Seconds between attempts to shift walls.', () => config.maze.shifting);

  const input = section('Interaction');
  check(input, config.input, 'drop', 'Tap to drop power pellets', 'Tap a cleared, unoccupied corridor.');
  check(input, config.input, 'control', 'Take Control', 'Steer with arrow keys or a swipe.');
  const manual = () => config.input.control;
  range(input, config.input, 'player', 'Controlled Pac-Man', 1, 4, 1, 'Pac-Man to steer. Falls back to the first if absent.', manual);
  range(input, config.input, 'idle', 'Autoplay delay', 1, 20, .5, 'Seconds of idle input before autoplay resumes.', manual);

  const features = section('Features');
  const descriptions = {
    corners: ['Ghost corner glow', 'Ghost-colored light spills into the next tile.'],
    surge: ['Power surge', 'Dim the maze and send a blue pulse along connected corridors.'],
    sparks: ['Pellet sparks', 'Warm sparks drift behind Pac-Man after a bite.'],
    regrowth: ['Pellet regrowth', 'Ease pellets in from small pinpricks.'],
    eyes: ['Ghost eye cues', 'Move pupils toward turns or back toward Pac-Man.'],
    pressure: ['Junction pressure', 'Mix ghost colors at a shared approach.'],
    rings: ['Power pellet charging rings', 'Show a ring that tightens as Pac-Man approaches.'],
    tunnel: ['Tunnel light echo', 'Flash both ends of a wraparound passage.'],
    pools: ['Glass and pellet light pools', 'Show warm floor pools in 3D.'],
    crt: ['CRT phosphor trails', 'Draw pixel-aligned afterimages and scanlines in 2D.']
  };
  for (const [key, [name, description]] of Object.entries(descriptions)) {
    const setting = config.features[key];
    const detail = section(name, features);
    check(detail, setting, 'enabled', 'Enable ' + name, description);
    range(detail, setting, 'strength', name + ' strength', 0, 1, .01,
      description, () => setting.enabled);
  }

  const empty = element('p', 'No matching settings in this view.', panel);
  const actions = element('div', '', panel);
  actions.className = 'actions';
  const copy = element('button', 'Copy config', actions);
  const feedback = element('div', '', panel);
  feedback.setAttribute('role', 'status');
  copy.onclick = async () => {
    feedback.replaceChildren();
    const code = 'const config = ' + JSON.stringify(config, null, 2) + ';';
    try {
      await navigator.clipboard.writeText(code);
      feedback.textContent = 'Config copied.';
    } catch {
      const output = element('textarea', '', feedback);
      output.value = code;
      output.readOnly = true;
      output.select();
    }
  };

  let wasSearching = false;
  function filter() {
    const query = search.value.trim().toLowerCase();
    if (query && !wasSearching) {
      for (const section of sections) section.open = section.details.open;
    }
    for (const { row, visible, query: text } of rows) row.hidden = !visible() || !text.includes(query);
    for (const { details, visible, title, open } of [...sections].reverse()) {
      const hasRows = [...details.children].some(child =>
        (child.tagName === 'LABEL' || child.tagName === 'DETAILS') && !child.hidden);
      details.hidden = !visible() || Boolean(query && !hasRows && !title.toLowerCase().includes(query));
      if (query) details.open = !details.hidden;
      else if (wasSearching) details.open = open;
    }
    empty.hidden = !query || sections.some(section => !section.details.hidden);
    wasSearching = Boolean(query);
    help.hidden = true;
  }

  function refresh() {
    for (const row of rows) row.sync();
    filter();
    onChange();
  }

  search.oninput = filter;
  refresh();
};