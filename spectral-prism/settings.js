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
    "environmentalLighting": {
        "enabled": true,
        "ambient": {
            "enabled": true,
            "color": "#b8c8e8",
            "intensity": 0.15,
            "hemisphere": false,
            "groundColor": "#303040"
        },
        "specular": {
            "enabled": true,
            "color": "#ffffff",
            "intensity": 1,
            "roughness": 0.06
        },
        "environment": {
            "enabled": true,
            "intensity": 0.8,
            "rotation": 0,
            "style": "studio",
            "verticalRotation": 0,
            "blur": 0.04
        },
        "directional": {
            "enabled": true,
            "color": "#ffffff",
            "intensity": 0.6,
            "azimuth": 45,
            "elevation": 35,
            "count": 1,
            "spread": 90
        },
        "point": {
            "enabled": false,
            "count": 3,
            "intensity": 1,
            "color": "#ffffff",
            "distance": 20,
            "decay": 2,
            "radius": 8,
            "height": 4,
            "colorVariation": false
        },
        "rim": {
            "enabled": true,
            "color": "#9bbcff",
            "intensity": 0.4,
            "power": 3,
            "width": 0.5
        },
        "animated": {
            "enabled": true,
            "count": 2,
            "speed": 0.2,
            "radius": 12,
            "intensity": 0.8,
            "colorVariation": false,
            "axis": "y",
            "pattern": "orbit",
            "speedVariation": 0
        },
        "spectral": {
            "enabled": true,
            "intensity": 0.6,
            "radius": 1.5,
            "count": 8
        },
        "fresnel": {
            "enabled": true,
            "intensity": 0.8,
            "color": "#ffffff",
            "falloff": 3
        },
        "masterIntensity": 1,
        "exposure": 1,
        "preset": "Custom",
        "studioPanels": {
            "count": 8,
            "size": 1,
            "distance": 8,
            "brightness": 3,
            "temperature": 6500
        },
        "shadows": {
            "enabled": false,
            "resolution": 1024,
            "softness": 2,
            "bias": -0.0001
        },
        "reflectionEnvironment": {
            "enabled": true,
            "source": "image",
            "file": "neon.png",
            "intensity": 1.5,
            "exposure": 1,
            "saturation": 1,
            "contrast": 1,
            "rotationX": 0,
            "rotationY": 0,
            "rotationZ": 0,
            "blur": 0.05,
            "animate": false,
            "animationSpeed": 2,
            "animationAxis": "y",
            "affectPrisms": true,
            "affectLightSources": true,
            "affectFloor": false,
            "reflectionOnly": true,
            "fallback": "procedural",
            "maxResolution": 1024,
            "independentLayer": true,
            "reflectionOpacity": 0.65,
            "reflectionStrength": 1.5,
            "reflectionRoughness": 0.02,
            "fresnelModulation": true,
            "fresnelPower": 3,
            "minReflectivity": 0.15,
            "maxReflectivity": 1,
            "tint": "#ffffff",
            "frontFaces": true,
            "backFaces": false,
            "chamferReflections": true,
            "chamferBoost": 1.5,
            "mirrorDiagnostic": false,
            "debugLogging": false,
            "autoRetry": true,
            "showPreview": true
        }
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
    },
    "edges": {
        "enabled": true,
        "color": "#aabbdd",
        "opacity": 0.35,
        "thickness": 1,
        "glow": false,
        "glowIntensity": 0.3,
        "showChamferEdges": true,
        "showHiddenEdges": false,
        "colorMode": "fixed"
    }
};
