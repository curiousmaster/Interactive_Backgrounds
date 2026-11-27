export default {
    "editor": {
        "enabled": true
    },
    "simulation": {
        "mode": "assisted",
        "speed": 1,
        "wavelengths": 48,
        "maxBounces": 8,
        "maxSegments": 10000,
        "minEnergy": 0.008,
        "quality": "auto"
    },
    "prisms": {
        "chamfer": 0.06,
        "count": 6,
        "shape": "hexagonal",
        "distribution": "cluster",
        "size": 1.3,
        "variation": 0.3,
        "rotation": true,
        "rotationSpeed": 8,
        "randomAxes": true,
        "drift": false,
        "driftSpeed": 0.8,
        "material": "crown",
        "customIndex": 1.52,
        "dispersion": 1.5,
        "roughness": 0.06,
        "opacity": 0.22
    },
    "light": {
        "showSource": true,
        "sourceShape": "laser",
        "sourceSize": 1,
        "sourceColor": "#526579",
        "count": 4,
        "type": "white",
        "wavelength": 532,
        "intensity": 0.5,
        "width": 0.045,
        "tracking": false,
        "pulse": false,
        "pulseSpeed": 2
    },
    "optics": {
        "refraction": true,
        "chromatic": true,
        "fresnel": true,
        "internalReflection": true,
        "absorption": 0.015
    },
    "view": {
        "perspective": true,
        "orbit": true,
        "orbitSpeed": 4,
        "zoom": 1,
        "tilt": 20
    },
    "environment": {
        "background": "#030308",
        "floor": false,
        "mirrors": false,
        "fog": 0.019
    },
    "bloom": {
        "enabled": true,
        "strength": 0.15,
        "radius": 0.45,
        "threshold": 0.15
    },
    "effects": {
        "halo": true,
        "haloStrength": 0.27,
        "dust": true,
        "dustCount": 1500,
        "impactGlow": true,
        "impactStrength": 0.8,
        "trails": false,
        "trailLength": 3,
        "trailOpacity": 0.25,
        "iridescence": true,
        "caustics": true,
        "internalLight": true,
        "pulses": false,
        "flare": true
    },
    "controls": {
        "enabled": true,
        "dragPrisms": true,
        "showStats": false
    }
};