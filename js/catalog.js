/* ==========================================================================
   Vesper Audio — Product Catalog, Finishes, Presets & SVG Hardware Factory
   ========================================================================== */

(function (global) {
  "use strict";

  let svgSeq = 0;

  const FINISHES = {
    obsidian: {
      id: "obsidian",
      code: "OBS",
      name: "Matte Obsidian",
      material: "Bead-blasted anodized 6061 aluminum",
      priceDelta: 0,
      swatch: "#1d1e21",
      body: "#1b1c1f",
      surface: "#27292e",
      trim: "#3d4047",
      accent: "#ff5c28",
      cone: "#121315",
      ink: "#dcdad3"
    },
    silver: {
      id: "silver",
      code: "SLV",
      name: "Brushed Silver",
      material: "Clear-anodized raw aerospace aluminum",
      priceDelta: 40,
      swatch: "#d5d7db",
      body: "#d2d4d8",
      surface: "#e6e7ea",
      trim: "#aeb2b9",
      accent: "#e04819",
      cone: "#222428",
      ink: "#262729"
    },
    orange: {
      id: "orange",
      code: "ORG",
      name: "Signal Orange",
      material: "Cerakote studio-edition finish",
      priceDelta: 80,
      swatch: "#e04819",
      body: "#e04819",
      surface: "#1c1d20",
      trim: "#b63710",
      accent: "#ffffff",
      cone: "#131416",
      ink: "#f6f5f2"
    },
    bone: {
      id: "bone",
      code: "BNE",
      name: "Warm Bone",
      material: "Micro-textured ceramic coating",
      priceDelta: 40,
      swatch: "#e3ddd1",
      body: "#e3ddd1",
      surface: "#ede8de",
      trim: "#bdb5a5",
      accent: "#1f7a4c",
      cone: "#292724",
      ink: "#302e2a"
    }
  };

  const PRODUCTS = [
    {
      id: "va-01",
      sku: "VA-01",
      category: "monitors",
      categoryLabel: "Studio Monitors",
      name: "Vesper Monitor One",
      tagline: "Bi-amplified nearfield studio reference monitor.",
      description:
        "Milled from a single billet of 6061 aluminum, the VA-01 pairs a beryllium dome tweeter with a 6.5-inch woven carbon driver for phase-coherent accuracy.",
      basePrice: 780,
      badge: "Flagship",
      badgeVariant: "accent",
      svgType: "monitor",
      finishes: ["obsidian", "silver", "orange", "bone"],
      specs: {
        "Frequency Response": "28 Hz - 24 kHz (+/-1.5 dB)",
        "Amplification": "180W Dual Class-AB/D",
        "THD+N (1 kHz)": "0.008%",
        "Inputs": "Balanced XLR, TRS, USB-C DSP",
        "Enclosure": "CNC 6061-T6 Unibody",
        "Weight": "7.4 kg (Single Unit)"
      }
    },
    {
      id: "va-02",
      sku: "VA-02",
      category: "headphones",
      categoryLabel: "Headphones",
      name: "Vesper Planar H1",
      tagline: "Open-back 100mm planar magnetic mastering headphones.",
      description:
        "Ultra-thin 1.2-micron diaphragm suspended in a dual-sided N52 neodymium array delivers effortless transient speed and zero listener fatigue.",
      basePrice: 540,
      badge: "Reference",
      badgeVariant: "default",
      svgType: "headphones-open",
      finishes: ["obsidian", "silver", "bone"],
      specs: {
        "Transducer": "100 mm Planar Magnetic",
        "Frequency Response": "10 Hz - 42 kHz",
        "Impedance": "38 Ohms (Pure Resistive)",
        "Sensitivity": "98 dB / 1 mW",
        "Cable": "Detachable Braided 4.4mm + 6.35mm",
        "Weight": "345 g"
      }
    },
    {
      id: "va-03",
      sku: "VA-03",
      category: "accessories",
      categoryLabel: "Accessories",
      name: "Vesper Field DAC",
      tagline: "Discrete R2R desktop DAC and Class-A headphone preamp.",
      description:
        "Precision resistor-ladder conversion with a zero-backlash optical rotary attenuator, OLED telemetry screen, and dual balanced outputs.",
      basePrice: 390,
      badge: "New",
      badgeVariant: "accent",
      svgType: "dac",
      finishes: ["obsidian", "silver", "orange"],
      specs: {
        "Architecture": "24-bit Discrete R2R Ladder",
        "Dynamic Range": "124 dB (A-weighted)",
        "Output Power": "2,400 mW @ 32 Ohms",
        "Digital Inputs": "USB-C, Optical TOSLINK, Coax",
        "Analog Outputs": "4.4mm Pentaconn, 6.35mm, RCA",
        "Weight": "620 g"
      }
    },
    {
      id: "va-04",
      sku: "VA-04",
      category: "monitors",
      categoryLabel: "Studio Monitors",
      name: "Vesper Sub Compact",
      tagline: "Dual-opposed force-cancelling studio subwoofer.",
      description:
        "Two opposing 8-inch long-throw drivers cancel cabinet vibration down to 19 Hz, extending nearfield systems without room boom.",
      basePrice: 920,
      badge: "Pro",
      badgeVariant: "default",
      svgType: "sub",
      finishes: ["obsidian", "silver"],
      specs: {
        "Frequency Response": "19 Hz - 140 Hz",
        "Amplification": "420W RMS Class-D",
        "Crossover": "DSP Variable (50-120 Hz)",
        "Max SPL": "114 dB Peak @ 1 m",
        "Connectivity": "XLR Stereo Thru, Sub-In",
        "Weight": "13.8 kg"
      }
    },
    {
      id: "va-05",
      sku: "VA-05",
      category: "headphones",
      categoryLabel: "Headphones",
      name: "Vesper Closed Studio M2",
      tagline: "Acoustic-sealed dynamic headphones for vocal & drum tracking.",
      description:
        "High-isolation CNC chambers with replaceable lambskin-memory-foam earpads minimize bleed into sensitive condenser microphones.",
      basePrice: 420,
      badge: "Studio",
      badgeVariant: "default",
      svgType: "headphones-closed",
      finishes: ["obsidian", "orange", "bone"],
      specs: {
        "Driver": "50 mm Beryllium Dynamic",
        "Isolation": "-26 dB Passive Attenuation",
        "Frequency Response": "14 Hz - 30 kHz",
        "Impedance": "64 Ohms",
        "Connector": "Locking Mini-XLR",
        "Weight": "295 g"
      }
    },
    {
      id: "va-06",
      sku: "VA-06",
      category: "accessories",
      categoryLabel: "Accessories",
      name: "Vesper Isolation Stand",
      tagline: "Precision +7 degree acoustic decoupling desktop stands (Pair).",
      description:
        "Machined aluminum risers fitted with tuned Sorbothane elastomers that eliminate desk resonance and align tweeters to ear height.",
      basePrice: 180,
      badge: "Pair",
      badgeVariant: "default",
      svgType: "stand",
      finishes: ["obsidian", "silver", "bone"],
      specs: {
        "Tilt Angle": "+7° Fixed Acoustic Axis",
        "Load Capacity": "Up to 18 kg per stand",
        "Damping": "Dual-Durometer Sorbothane",
        "Dimensions": "210 x 175 x 95 mm",
        "Finish": "Bead-Blasted Anodized",
        "Weight": "1.6 kg (Pair)"
      }
    }
  ];

  // Curve values represent dB offset across 12 logarithmic frequency checkpoints (20Hz -> 20kHz)
  const SOUND_PROFILES = {
    flat: {
      id: "flat",
      name: "Studio Flat",
      subtitle: "Reference Calibration · +/- 0.4 dB",
      description:
        "Linear phase and amplitude across the audible spectrum for critical mixing and mastering decisions.",
      points: [0, 0.1, 0, -0.1, 0, 0.1, 0, 0, -0.1, 0, 0.1, -0.2]
    },
    analog: {
      id: "analog",
      name: "Warm Analog",
      subtitle: "Tape Contour · +2.4 dB Sub / Soft Air",
      description:
        "Gentle low-shelf richness around 65 Hz paired with a relaxed high-frequency roll-off inspired by vintage mastering consoles.",
      points: [1.8, 2.4, 2.1, 1.3, 0.4, 0, -0.2, -0.3, -0.5, -0.9, -1.5, -2.2]
    },
    spatial: {
      id: "spatial",
      name: "Spatial Stage",
      subtitle: "Wide Dispersion · +1.8 dB Presence",
      description:
        "Subtle upper-mid clarity and high-end air lift engineered for immersive soundstage depth at low late-night listening levels.",
      points: [1.1, 1.4, 0.6, -0.4, -0.3, 0.4, 1.2, 1.8, 1.5, 1.9, 2.2, 1.6]
    }
  };

  function getFinish(finishId) {
    return FINISHES[finishId] || FINISHES.obsidian;
  }

  function getProduct(productId) {
    return PRODUCTS.find(function (p) {
      return p.id === productId;
    }) || PRODUCTS[0];
  }

  function renderMonitorSvg(f, id) {
    return `
      <svg viewBox="0 0 280 320" role="img" aria-label="Vesper Monitor One studio speaker in ${f.name}">
        <defs>
          <linearGradient id="cab-${id}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${f.surface}"/>
            <stop offset="100%" stop-color="${f.body}"/>
          </linearGradient>
          <radialGradient id="cone-${id}" cx="45%" cy="42%" r="60%">
            <stop offset="0%" stop-color="${f.trim}"/>
            <stop offset="55%" stop-color="${f.cone}"/>
            <stop offset="100%" stop-color="#09090a"/>
          </radialGradient>
          <pattern id="grill-${id}" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.15" fill="${f.cone}" opacity="0.65"/>
          </pattern>
        </defs>
        <!-- Isolation base shadow -->
        <ellipse cx="140" cy="306" rx="88" ry="8" fill="#000" opacity="0.18"/>
        <!-- Machined feet -->
        <rect x="66" y="294" width="22" height="8" rx="3" fill="${f.cone}"/>
        <rect x="192" y="294" width="22" height="8" rx="3" fill="${f.cone}"/>
        <!-- Outer CNC Enclosure -->
        <rect x="44" y="18" width="192" height="278" rx="22" fill="url(#cab-${id})" stroke="${f.trim}" stroke-width="2.5"/>
        <!-- Recessed Baffle -->
        <rect x="58" y="32" width="164" height="250" rx="14" fill="${f.surface}" stroke="${f.trim}" stroke-width="1"/>
        <!-- Tweeter Waveguide -->
        <circle cx="140" cy="84" r="32" fill="${f.body}" stroke="${f.trim}" stroke-width="1.5"/>
        <circle cx="140" cy="84" r="24" fill="url(#grill-${id})"/>
        <circle cx="140" cy="84" r="10" fill="${f.cone}" stroke="${f.trim}" stroke-width="1"/>
        <!-- Accent LED -->
        <circle cx="204" cy="48" r="3.5" fill="${f.accent}"/>
        <!-- Primary 6.5" Woofer -->
        <circle cx="140" cy="192" r="64" fill="${f.cone}" stroke="${f.trim}" stroke-width="2"/>
        <circle cx="140" cy="192" r="54" fill="url(#cone-${id})"/>
        <circle cx="140" cy="192" r="38" fill="none" stroke="${f.trim}" stroke-width="0.8" opacity="0.45"/>
        <circle cx="140" cy="192" r="18" fill="${f.body}" stroke="${f.trim}" stroke-width="1.4"/>
        <circle cx="140" cy="192" r="5" fill="${f.accent}"/>
        <!-- Precision Rotary Gain Knob & Tag -->
        <circle cx="196" cy="262" r="11" fill="${f.body}" stroke="${f.trim}" stroke-width="1.5"/>
        <line x1="196" y1="262" x2="202" y2="255" stroke="${f.accent}" stroke-width="2" stroke-linecap="round"/>
        <text x="72" y="266" fill="${f.ink}" font-family="monospace" font-size="9" font-weight="600" letter-spacing="1.2">VA-01</text>
      </svg>`;
  }

  function renderHeadphonesSvg(f, id, isOpen) {
    return `
      <svg viewBox="0 0 280 280" role="img" aria-label="Vesper headphones in ${f.name}">
        <defs>
          <pattern id="hp-perf-${id}" width="7" height="7" patternUnits="userSpaceOnUse">
            <circle cx="3.5" cy="3.5" r="1.4" fill="${f.cone}" opacity="0.7"/>
          </pattern>
        </defs>
        <ellipse cx="140" cy="256" rx="74" ry="8" fill="#000" opacity="0.16"/>
        <!-- Spring-steel Headband -->
        <path d="M56 146 C56 54, 224 54, 224 146" fill="none" stroke="${f.trim}" stroke-width="12" stroke-linecap="round"/>
        <path d="M62 142 C62 62, 218 62, 218 142" fill="none" stroke="${f.body}" stroke-width="6" stroke-linecap="round"/>
        <!-- Inner Suspension Strap -->
        <path d="M74 128 C84 82, 196 82, 206 128" fill="none" stroke="${f.cone}" stroke-width="6" stroke-linecap="round"/>
        <!-- Left & Right Yokes -->
        <rect x="46" y="136" width="12" height="36" rx="4" fill="${f.trim}"/>
        <rect x="222" y="136" width="12" height="36" rx="4" fill="${f.trim}"/>
        <!-- Ear Cushions -->
        <rect x="58" y="142" width="26" height="86" rx="13" fill="${f.cone}"/>
        <rect x="196" y="142" width="26" height="86" rx="13" fill="${f.cone}"/>
        <!-- Outer CNC Earcups -->
        <rect x="34" y="146" width="32" height="78" rx="14" fill="${f.body}" stroke="${f.trim}" stroke-width="2"/>
        <rect x="214" y="146" width="32" height="78" rx="14" fill="${f.body}" stroke="${f.trim}" stroke-width="2"/>
        ${isOpen
          ? `<rect x="40" y="156" width="18" height="58" rx="9" fill="url(#hp-perf-${id})"/>
             <rect x="222" y="156" width="18" height="58" rx="9" fill="url(#hp-perf-${id})"/>`
          : `<line x1="48" y1="164" x2="48" y2="206" stroke="${f.trim}" stroke-width="2" stroke-linecap="round"/>
             <line x1="232" y1="164" x2="232" y2="206" stroke="${f.trim}" stroke-width="2" stroke-linecap="round"/>`}
        <!-- Accent Ring Details -->
        <circle cx="50" cy="185" r="4" fill="${f.accent}"/>
        <circle cx="230" cy="185" r="4" fill="${f.accent}"/>
      </svg>`;
  }

  function renderDacSvg(f, id) {
    return `
      <svg viewBox="0 0 280 220" role="img" aria-label="Vesper Field DAC in ${f.name}">
        <ellipse cx="140" cy="198" rx="108" ry="8" fill="#000" opacity="0.16"/>
        <!-- Unibody Chassis -->
        <rect x="24" y="54" width="232" height="124" rx="16" fill="${f.body}" stroke="${f.trim}" stroke-width="2.5"/>
        <rect x="34" y="64" width="212" height="104" rx="10" fill="${f.surface}" stroke="${f.trim}" stroke-width="1"/>
        <!-- OLED Telemetry Screen -->
        <rect x="48" y="82" width="112" height="44" rx="6" fill="#0d0e10" stroke="${f.trim}" stroke-width="1.2"/>
        <text x="58" y="102" fill="#f3f2ee" font-family="monospace" font-size="11" font-weight="600">96.0 kHz</text>
        <text x="58" y="118" fill="${f.accent}" font-family="monospace" font-size="9">R2R · -14.0 dB</text>
        <!-- Stepped Volume Attenuator -->
        <circle cx="206" cy="116" r="28" fill="${f.body}" stroke="${f.trim}" stroke-width="2"/>
        <circle cx="206" cy="116" r="21" fill="${f.surface}" stroke="${f.trim}" stroke-width="1"/>
        <line x1="206" y1="116" x2="218" y2="103" stroke="${f.accent}" stroke-width="2.6" stroke-linecap="round"/>
        <!-- Balanced & Single-Ended Output Jacks -->
        <circle cx="62" cy="148" r="9" fill="${f.cone}" stroke="${f.trim}" stroke-width="1.5"/>
        <circle cx="62" cy="148" r="4" fill="#08090a"/>
        <circle cx="94" cy="148" r="7" fill="${f.cone}" stroke="${f.trim}" stroke-width="1.5"/>
        <circle cx="94" cy="148" r="3" fill="#08090a"/>
        <!-- Tactile Switches -->
        <rect x="122" y="142" width="22" height="12" rx="6" fill="${f.trim}"/>
        <circle cx="137" cy="148" r="4" fill="${f.accent}"/>
        <text x="184" y="160" fill="${f.ink}" font-family="monospace" font-size="8.5" font-weight="600">VA-03</text>
      </svg>`;
  }

  function renderSubSvg(f, id) {
    return `
      <svg viewBox="0 0 280 280" role="img" aria-label="Vesper Sub Compact subwoofer in ${f.name}">
        <ellipse cx="140" cy="252" rx="94" ry="8" fill="#000" opacity="0.18"/>
        <rect x="46" y="34" width="188" height="206" rx="22" fill="${f.body}" stroke="${f.trim}" stroke-width="2.5"/>
        <rect x="60" y="48" width="160" height="178" rx="14" fill="${f.surface}" stroke="${f.trim}" stroke-width="1"/>
        <!-- Recessed Force-Cancelling Ring -->
        <circle cx="140" cy="136" r="60" fill="${f.cone}" stroke="${f.trim}" stroke-width="2"/>
        <circle cx="140" cy="136" r="46" fill="${f.body}" stroke="${f.trim}" stroke-width="1.5"/>
        <circle cx="140" cy="136" r="24" fill="${f.cone}"/>
        <!-- Bottom Acoustic Slot -->
        <rect x="84" y="208" width="112" height="8" rx="4" fill="${f.cone}"/>
        <circle cx="204" cy="64" r="3.5" fill="${f.accent}"/>
        <text x="72" y="67" fill="${f.ink}" font-family="monospace" font-size="8.5" font-weight="600">VA-04 SUB</text>
      </svg>`;
  }

  function renderStandSvg(f, id) {
    return `
      <svg viewBox="0 0 280 220" role="img" aria-label="Vesper Isolation Stands in ${f.name}">
        <ellipse cx="92" cy="194" rx="54" ry="6" fill="#000" opacity="0.14"/>
        <ellipse cx="192" cy="194" rx="54" ry="6" fill="#000" opacity="0.14"/>
        <!-- Left Stand (+7 deg tilted top plate) -->
        <path d="M48 186 L134 186 L134 176 L58 176 Z" fill="${f.trim}"/>
        <path d="M84 176 L92 104 L106 104 L98 176 Z" fill="${f.body}" stroke="${f.trim}" stroke-width="1.5"/>
        <polygon points="44,86 138,100 136,112 42,98" fill="${f.surface}" stroke="${f.trim}" stroke-width="1.8"/>
        <line x1="50" y1="87" x2="132" y2="99" stroke="${f.accent}" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Right Stand -->
        <path d="M148 186 L234 186 L234 176 L158 176 Z" fill="${f.trim}"/>
        <path d="M184 176 L192 104 L206 104 L198 176 Z" fill="${f.body}" stroke="${f.trim}" stroke-width="1.5"/>
        <polygon points="144,86 238,100 236,112 142,98" fill="${f.surface}" stroke="${f.trim}" stroke-width="1.8"/>
        <line x1="150" y1="87" x2="232" y2="99" stroke="${f.accent}" stroke-width="2.5" stroke-linecap="round"/>
        <text x="114" y="208" fill="${f.ink}" font-family="monospace" font-size="9" font-weight="600">+7° ISOLATION</text>
      </svg>`;
  }

  function renderProductSvg(productId, finishId) {
    const product = getProduct(productId);
    const finish = getFinish(finishId || product.finishes[0]);
    const id = ++svgSeq;

    switch (product.svgType) {
      case "monitor":
        return renderMonitorSvg(finish, id);
      case "headphones-open":
        return renderHeadphonesSvg(finish, id, true);
      case "headphones-closed":
        return renderHeadphonesSvg(finish, id, false);
      case "dac":
        return renderDacSvg(finish, id);
      case "sub":
        return renderSubSvg(finish, id);
      case "stand":
        return renderStandSvg(finish, id);
      default:
        return renderMonitorSvg(finish, id);
    }
  }

  global.VesperData = {
    FINISHES: FINISHES,
    PRODUCTS: PRODUCTS,
    SOUND_PROFILES: SOUND_PROFILES,
    getFinish: getFinish,
    getProduct: getProduct,
    renderProductSvg: renderProductSvg
  };
})(window);
