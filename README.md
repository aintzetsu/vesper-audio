# Vesper Audio — Studio Hardware Storefront Showcase

A responsive, zero-dependency frontend showcase for a fictional industrial-design audio brand (**Vesper Audio**), engineered with modular HTML5, CSS3 custom properties, and Vanilla JavaScript.

## Key Features
- **Interactive Hardware Customizer (`VA-01`)**: Switch between four anodized finishes (*Matte Obsidian*, *Brushed Silver*, *Signal Orange*, *Warm Bone*) and single vs. matched stereo pair pricing with live SVG hardware updates and acoustic callout overlays.
- **Filterable Catalog & Quick-View Modal**: Category filters, price sorting, inline card finish previews, and an accessible technical specifications modal.
- **Live DSP Acoustic Visualizer & Web Audio Synth**: HiDPI HTML5 `<canvas>` rendering smoothed logarithmic frequency response curves across three DSP voicings (*Studio Flat*, *Warm Analog*, *Spatial Stage*), plus an optional user-triggered Web Audio API reference chord shaped by `BiquadFilterNode`.
- **Slide-Over Studio Bag (Cart)**: Persistent `localStorage` state, quantity steppers, free-shipping threshold indicator, demo promo code (`STUDIO10` for 10% off), and simulated checkout confirmation.
- **Dual Theme System & Accessibility**: Persistent Light (*Studio Paper*) and Dark (*Acoustic Chamber*) themes, keyboard `Escape` handling, ARIA attributes, and `prefers-reduced-motion` support.

## Project Structure
```text
vesper-audio/
├── index.html
├── styles/
│   ├── tokens.css      # Theme variables & typography tokens
│   ├── main.css        # Swiss grid layout & section styling
│   └── components.css  # Modals, slide-over cart drawer & toasts
├── js/
│   ├── catalog.js      # Product catalog, finishes, presets & dynamic SVG generator
│   ├── visualizer.js   # HiDPI canvas EQ curve + Web Audio reference tone
│   └── app.js          # Application state, persistence & event orchestration
└── README.md
```

## Running Locally
- **Direct Open:** Double-click `index.html` to open directly in any modern browser (uses non-module `<script defer>` loading so `file://` works cleanly without CORS errors).
- **Local Server:** Run `python -m http.server 8080` or `npx serve .` from the `vesper-audio` directory.
