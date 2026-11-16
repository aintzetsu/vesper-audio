/* ==========================================================================
   Vesper Audio — Interactive Acoustic Frequency Visualizer & Web Audio Demo
   ========================================================================== */

(function (global) {
  "use strict";

  const FREQ_LABELS = ["20 Hz", "100 Hz", "500 Hz", "1 kHz", "5 kHz", "20 kHz"];

  function createVisualizer(canvas, onToneStateChange) {
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    const reducedMotion = global.matchMedia &&
      global.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let currentPoints = global.VesperData.SOUND_PROFILES.flat.points.slice();
    let targetPoints = currentPoints.slice();
    let rafId = null;
    let phase = 0;

    // Optional Web Audio gentle studio chord state
    let audioCtx = null;
    let masterGain = null;
    let filterNode = null;
    let oscillators = [];
    let isPlayingTone = false;

    function getThemeColors() {
      const styles = getComputedStyle(document.documentElement);
      return {
        accent: styles.getPropertyValue("--accent").trim() || "#e04819",
        accentSoft: styles.getPropertyValue("--accent-soft").trim() || "rgba(224,72,25,0.14)",
        border: styles.getPropertyValue("--border").trim() || "rgba(0,0,0,0.12)",
        muted: styles.getPropertyValue("--ink-muted").trim() || "#6c6a63",
        ink: styles.getPropertyValue("--ink").trim() || "#141413"
      };
    }

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(global.devicePixelRatio || 1, 2);
      canvas.width = Math.max(300, Math.floor(rect.width * dpr));
      canvas.height = Math.max(180, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function applyFilterForProfile(profileId) {
      if (!audioCtx || !filterNode) return;
      const now = audioCtx.currentTime;
      if (profileId === "analog") {
        filterNode.type = "lowshelf";
        filterNode.frequency.setTargetAtTime(180, now, 0.08);
        filterNode.gain.setTargetAtTime(4.5, now, 0.08);
      } else if (profileId === "spatial") {
        filterNode.type = "peaking";
        filterNode.frequency.setTargetAtTime(1400, now, 0.08);
        filterNode.gain.setTargetAtTime(3.2, now, 0.08);
      } else {
        filterNode.type = "allpass";
        filterNode.frequency.setTargetAtTime(1000, now, 0.08);
      }
    }

    function setProfile(profileId) {
      const profile = global.VesperData.SOUND_PROFILES[profileId] || global.VesperData.SOUND_PROFILES.flat;
      targetPoints = profile.points.slice();
      applyFilterForProfile(profile.id);
      if (reducedMotion) {
        currentPoints = targetPoints.slice();
        drawFrame();
      }
    }

    function stopTone() {
      if (!audioCtx || !isPlayingTone) return;
      const now = audioCtx.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(masterGain.gain.value, now);
      masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.18);
      const oldOscs = oscillators;
      oscillators = [];
      isPlayingTone = false;
      setTimeout(function () {
        oldOscs.forEach(function (osc) {
          try {
            osc.stop();
            osc.disconnect();
          } catch (_err) {
            // Ignore already-stopped oscillators
          }
        });
      }, 220);
      if (onToneStateChange) onToneStateChange(false);
    }

    function toggleTone(activeProfileId) {
      const AudioContextCtor = global.AudioContext || global.webkitAudioContext;
      if (!AudioContextCtor) return false;

      if (isPlayingTone) {
        stopTone();
        return false;
      }

      if (!audioCtx) {
        audioCtx = new AudioContextCtor();
      }
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      filterNode = audioCtx.createBiquadFilter();
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.035, audioCtx.currentTime + 0.25);

      filterNode.connect(masterGain);
      masterGain.connect(audioCtx.destination);
      applyFilterForProfile(activeProfileId);

      // Gentle warm studio triad (A2, E3, B3, C#4)
      [110, 164.81, 246.94, 277.18].forEach(function (freq) {
        const osc = audioCtx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.connect(filterNode);
        osc.start();
        oscillators.push(osc);
      });

      isPlayingTone = true;
      if (onToneStateChange) onToneStateChange(true);
      return true;
    }

    function drawFrame() {
      const width = canvas.clientWidth || 600;
      const height = canvas.clientHeight || 220;
      const pad = { top: 20, right: 18, bottom: 28, left: 42 };
      const plotW = Math.max(80, width - pad.left - pad.right);
      const plotH = Math.max(80, height - pad.top - pad.bottom);
      const midY = pad.top + plotH * 0.5;
      const dbScale = plotH / 8; // +/-4 dB range
      const colors = getThemeColors();

      ctx.clearRect(0, 0, width, height);

      // Horizontal dB reference lines (+4, 0, -4)
      ctx.font = "11px monospace";
      ctx.textBaseline = "middle";
      [-3, 0, 3].forEach(function (db) {
        const y = midY - db * dbScale;
        ctx.strokeStyle = db === 0 ? colors.muted : colors.border;
        ctx.lineWidth = db === 0 ? 1 : 0.75;
        ctx.setLineDash(db === 0 ? [4, 4] : []);
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(pad.left + plotW, y);
        ctx.stroke();

        ctx.fillStyle = colors.muted;
        ctx.textAlign = "right";
        const label = (db > 0 ? "+" : "") + db + "dB";
        ctx.fillText(label, pad.left - 8, y);
      });
      ctx.setLineDash([]);

      // Vertical frequency grid & labels
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      FREQ_LABELS.forEach(function (label, idx) {
        const x = pad.left + (idx / (FREQ_LABELS.length - 1)) * plotW;
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.moveTo(x, pad.top);
        ctx.lineTo(x, pad.top + plotH);
        ctx.stroke();

        ctx.fillStyle = colors.muted;
        ctx.fillText(label, x, pad.top + plotH + 8);
      });

      // Harmonic spectrum bars along bottom
      const barCount = 36;
      const barStep = plotW / barCount;
      for (let i = 0; i < barCount; i++) {
        const t = i / (barCount - 1);
        const ptIdx = t * (currentPoints.length - 1);
        const lowIdx = Math.floor(ptIdx);
        const highIdx = Math.min(currentPoints.length - 1, lowIdx + 1);
        const frac = ptIdx - lowIdx;
        const curveDb = currentPoints[lowIdx] * (1 - frac) + currentPoints[highIdx] * frac;

        const amp = isPlayingTone
          ? 0.42 + 0.45 * Math.abs(Math.sin(phase * 2.4 + i * 0.48))
          : 0.14 + 0.08 * Math.sin(phase + i * 0.35);
        const barH = Math.max(4, (amp * 0.45 + (curveDb + 3) * 0.05) * (plotH * 0.55));
        const bx = pad.left + i * barStep + barStep * 0.22;
        const bw = Math.max(2, barStep * 0.56);
        const by = pad.top + plotH - barH;

        ctx.fillStyle = colors.accentSoft;
        ctx.fillRect(bx, by, bw, barH);
      }

      // Interpolate points smoothly toward target
      let moving = false;
      for (let i = 0; i < currentPoints.length; i++) {
        const diff = targetPoints[i] - currentPoints[i];
        if (Math.abs(diff) > 0.004) {
          currentPoints[i] += diff * 0.14;
          moving = true;
        } else {
          currentPoints[i] = targetPoints[i];
        }
      }

      // Build smooth frequency response spline
      const coords = currentPoints.map(function (db, idx) {
        const x = pad.left + (idx / (currentPoints.length - 1)) * plotW;
        const ripple = isPlayingTone ? Math.sin(phase * 3 + idx * 0.7) * 0.14 : 0;
        const y = midY - (db + ripple) * dbScale;
        return { x: x, y: y };
      });

      ctx.beginPath();
      ctx.moveTo(coords[0].x, coords[0].y);
      for (let i = 0; i < coords.length - 1; i++) {
        const xc = (coords[i].x + coords[i + 1].x) / 2;
        const yc = (coords[i].y + coords[i + 1].y) / 2;
        ctx.quadraticCurveTo(coords[i].x, coords[i].y, xc, yc);
      }
      const last = coords[coords.length - 1];
      ctx.lineTo(last.x, last.y);

      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 2.6;
      ctx.stroke();

      // Node markers
      ctx.fillStyle = colors.ink;
      coords.forEach(function (pt, idx) {
        if (idx % 2 === 0 || idx === coords.length - 1) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2.8, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      return moving;
    }

    function tick() {
      phase += isPlayingTone ? 0.045 : 0.015;
      drawFrame();
      if (!reducedMotion) {
        rafId = global.requestAnimationFrame(tick);
      }
    }

    function start() {
      resize();
      drawFrame();
      if (!reducedMotion && !rafId) {
        rafId = global.requestAnimationFrame(tick);
      }
    }

    global.addEventListener("resize", function () {
      resize();
      drawFrame();
    });

    return {
      start: start,
      setProfile: setProfile,
      toggleTone: toggleTone,
      stopTone: stopTone,
      redraw: drawFrame
    };
  }

  global.VesperVisualizer = {
    create: createVisualizer
  };
})(window);
