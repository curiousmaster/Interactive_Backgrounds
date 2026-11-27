export default {
    editor: {
        enabled: true
    },
    simulation: {
        mode: 'assisted', speed: 1, wavelengths: 48, maxBounces: 8, maxSegments: 10000, minEnergy: 0.008, quality: 'auto'
    },
    prisms: {
        count: 8, shape: 'triangular', distribution: 'cluster', size: 1.3, variation: 0.3, rotation: true, rotationSpeed: 8, randomAxes: true, drift: true, driftSpeed: 0.15, material: 'crown', customIndex: 1.52, dispersion: 1.5, roughness: 0.06, opacity: 0.22
    },
    light: {
        count: 2, type: 'white', wavelength: 532, intensity: 2.5, width: 0.025, tracking: true, pulse: false, pulseSpeed: 2
    },
    optics: {
        refraction: true, chromatic: true, fresnel: true, internalReflection: true, absorption: 0.015
    },
    view: {
        perspective: true, orbit: true, orbitSpeed: 4, zoom: 1, tilt: 20
    },
    environment: {
        background: '#030308', floor: false, mirrors: false, fog: 0.012
    },
    bloom: {
        enabled: true, strength: 1.4, radius: 0.45, threshold: 0.15
    },
    effects: {
        halo: true, haloStrength: 0.12, dust: true, dustCount: 1500, impactGlow: true, impactStrength: 0.8, trails: true, trailLength: 0.8, trailOpacity: 0.25, iridescence: false, caustics: true, internalLight: true, pulses: false, flare: false
    },
    controls: {
        enabled: true, dragPrisms: true, showStats: false
    }
};