export const defaults = {
    editor: {
        enabled: true
    },
    grid: {
        radius: 0.65,
        columns: 42,
        rows: 42,
        gap: 0.07,
        thickness: 0.45,
        fixedGrid: true,
        topChamfer: 0.08
    },
    view: {
        threeD: true,
        perspective: true,
        tilt: 48,
        yaw: 25,
        zoom: 1,
        orbit: true,
        orbitSpeed: 5,
        shape: 'flat',
        curvature: 0.65
    },
    material: {
        background: '#080b18',
        color: '#17364d',
        accent: '#38eaff',
        secondary: '#a34dff',
        metalness: 0.75,
        roughness: 0.28,
        opacity: 1
    },
    animation: {
        speed: 1,
        amplitude: 0.65,
        frequency: 0.48
    },
    interaction: {
        enabled: true,
        radius: 4,
        force: 1.6
    },
    lighting: {
        ambient: 0.65,
        intensity: 85,
        secondaryIntensity: 65,
        shadows: false
    },
    features: {
        terrain: {
            enabled: true
        },
        shockwaves: {
            enabled: true,
            speed: 5,
            decay: 1.2
        },
        iridescence: {
            enabled: true,
            strength: 0.3
        },
        energy: {
            enabled: true,
            strength: 0.7
        },
        glass: {
            enabled: false,
            transmission: 0.85
        },
        movingLights: {
            enabled: true,
            speed: 0.5
        },
        floating: {
            enabled: false,
            height: 3
        },
        channels: {
            enabled: true,
            strength: 0.8
        },
        particles: {
            enabled: true,
            count: 400
        },
        automata: {
            enabled: false,
            interval: 0.4
        },
        interference: {
            enabled: true,
            strength: 0.5
        },
        destruction: {
            enabled: false,
            strength: 2
        },
        flight: {
            enabled: false,
            speed: 2
        },
        tracers: {
            enabled: true,
            strength: 0.7
        }
    },
    post: {
        bloom: true,
        strength: 0.65,
        radius: 0.4,
        threshold: 0.65,
        fog: true,
        density: 0.025
    },
    performance: {
        pixelRatio: 1.5,
        adaptive: true
    }
};
export const choices = {
    'view.shape': ['flat', 'curved', 'cylinder', 'dome', 'torus']
};
export const ranges = {
    'grid.radius': [0.2, 1.5, 0.05],
    'grid.columns': [8, 80, 1],
    'grid.rows': [8, 80, 1],
    'grid.gap': [0.01, 0.3, 0.01],
    'grid.thickness': [0.05, 2, 0.05],
    'grid.topChamfer': [0, 0.45, 0.01],
    'view.tilt': [0, 85, 1],
    'view.yaw': [ - 180, 180, 1],
    'view.zoom': [0.2, 4, 0.05],
    'view.orbitSpeed': [ - 30, 30, 1],
    'lighting.intensity': [0, 250, 1],
    'lighting.secondaryIntensity': [0, 250, 1],
    'features.particles.count': [0, 2000, 50],
    'post.density': [0, 0.12, 0.001],
    'performance.pixelRatio': [0.5, 2, 0.1]
};
export const descriptions = {
    grid: 'Hexagonal lattice dimensions and geometry.',
    'grid.fixedGrid': 'Show the stationary energy lattice beneath the moving tiles.',
    'grid.topChamfer': 'Width of the upper bevel as a fraction of the tile radius. Limited by tile thickness.',
    view: 'Camera projection, orientation and surface topology.',
    material: 'Surface colors and physical material properties. Background accepts #RRGGBBAA.',
    animation: 'Global motion and wave parameters.',
    interaction: 'Pointer disturbance and impact strength.',
    lighting: 'Ambient and moving point lights.',
    features: 'Independently switchable visual effects.',
    post: 'Bloom and atmospheric fog.',
    performance: 'Resolution and adaptive quality.',
    'features.automata': 'Hexagonal cellular automaton using six adjacent cells.',
    'features.destruction': 'Temporary tile fragmentation after an impact.',
    'features.flight': 'Continuous camera travel over a repeating lattice.'
};
export const presets = {
    'Cyber Nexus': {},
    'Molten Core': {
        material: {
            color: '#35130d',
            accent: '#ff4900',
            secondary: '#ffbd22'
        },
        features: {
            channels: {
                strength: 2
            }
        }
    },
    'Frozen Crystal': {
        material: {
            color: '#a9eaff',
            accent: '#ffffff',
            secondary: '#68aaff',
            roughness: 0.12
        },
        features: {
            glass: {
                enabled: true
            }
        }
    },
    'Black Gold': {
        material: {
            color: '#30200b',
            accent: '#ffc54c',
            secondary: '#a66a19',
            metalness: 1
        }
    },
    'Chromatic Shift': {
        material: {
            color: '#432461',
            accent: '#ff55ca',
            secondary: '#38eaff'
        },
        features: {
            iridescence: {
                strength: 1
            }
        }
    },
    'Alien Organism': {
        material: {
            color: '#102b18',
            accent: '#8dff38',
            secondary: '#19bc72'
        },
        features: {
            automata: {
                enabled: true
            }
        }
    },
    'Liquid Ocean': {
        material: {
            color: '#073b69',
            accent: '#36e6ff'
        },
        animation: {
            amplitude: 1.4
        },
        features: {
            interference: {
                strength: 1
            }
        }
    },
    'Crimson Reactor': {
        material: {
            color: '#310c19',
            accent: '#ff173e',
            secondary: '#ff7938'
        },
        features: {
            shockwaves: {
                speed: 8
            }
        }
    },
    'Minimal Architecture': {
        material: {
            background: '#d9e0e5',
            color: '#b8c2ca',
            accent: '#ffffff',
            metalness: 0,
            roughness: 0.85
        },
        post: {
            bloom: false,
            fog: false
        },
        features: {
            channels: {
                enabled: false
            },
            tracers: {
                enabled: false
            },
            particles: {
                enabled: false
            }
        }
    },
    'Zero Gravity': {
        features: {
            floating: {
                enabled: true,
                height: 5
            }
        },
        view: {
            shape: 'curved'
        }
    },
    'Hyperspace': {
        view: {
            shape: 'cylinder'
        },
        features: {
            flight: {
                enabled: true,
                speed: 5
            }
        }
    },
    'Quantum Circuit': {
        material: {
            color: '#171b20',
            accent: '#ffb938'
        },
        features: {
            tracers: {
                strength: 2
            },
            automata: {
                enabled: true
            }
        }
    }
};
export function merge(base, patch) {
    const out = structuredClone(base);
    for (const[k, v] of Object.entries(patch || {})) {
        if (!Object.hasOwn(base, k)) continue;
        if (v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object') out[k] = merge(base[k], v);
        else if (typeof v === typeof base[k]) out[k] = v;
    }
    return out;
}