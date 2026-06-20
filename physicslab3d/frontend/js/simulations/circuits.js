/**
 * circuits.js — Simulação de Circuitos Elétricos
 *
 * Mostra um circuito com fonte, resistores e lâmpada.
 * O brilho da lâmpada é proporcional à potência (P = V × I).
 * Partículas animam o fluxo de corrente.
 */

const CircuitsSimulation = (() => {

  let canvas, ctx;
  let animationId;
  let particles = [];

  let state = {
    voltage:    12,
    resistance: 10,
    current:    1.2,
    power:      14.4,
    brightness: 0.24  // 0 a 1
  };

  // ── INICIALIZAÇÃO ──────────────────────────────────────────

  function init() {
    canvas = document.getElementById('canvas-circuits');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    setupSize();
    setupInputs();
    createParticles();
    update();
    animate();
  }

  function setupSize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
  }

  // ── INPUTS ─────────────────────────────────────────────────

  function setupInputs() {
    UI.syncInputs('cir-voltage', 'cir-voltage-num', (val) => {
      state.voltage = val;
      update();
    });

    UI.syncInputs('cir-resistance', 'cir-resistance-num', (val) => {
      state.resistance = val;
      update();
    });
  }

  // ── CÁLCULO ────────────────────────────────────────────────

  async function update() {
    try {
      const data = await API.calcOhm({
        voltage:    state.voltage,
        resistance: state.resistance
      });

      state.current    = data.current;
      state.power      = data.power;
      // Normaliza brilho entre 0 e 1 (máximo quando P = 250W)
      state.brightness = Math.min(data.power / 250, 1);

    } catch {
      state.current    = state.voltage / state.resistance;
      state.power      = state.voltage * state.current;
      state.brightness = Math.min(state.power / 250, 1);
    }

    // Atualiza UI
    UI.setText('cir-voltage-display',  UI.formatNumber(state.voltage, 0) + ' V');
    UI.setText('cir-current-display',  UI.formatNumber(state.current, 2) + ' A');
    UI.setText('cir-brightness',       Math.round(state.brightness * 100) + ' %');

    // Barra de brilho
    const lampFill = document.getElementById('lamp-fill');
    if (lampFill) lampFill.style.width = (state.brightness * 100) + '%';

    // Emoji da lâmpada
    const lampBulb = document.getElementById('lamp-bulb');
    if (lampBulb) {
      if (state.brightness > 0.1) {
        lampBulb.classList.add('on');
      } else {
        lampBulb.classList.remove('on');
      }
    }
  }

  // ── PARTÍCULAS ─────────────────────────────────────────────

  function createParticles() {
    particles = [];
    for (let i = 0; i < 25; i++) {
      particles.push({
        progress: i / 25,
        size:     Math.random() * 2 + 2
      });
    }
  }

  // ── ANIMAÇÃO ───────────────────────────────────────────────

  function animate() {
    animationId = requestAnimationFrame(animate);

    const speed = 0.004 * (0.5 + state.current / 5);
    particles.forEach(p => {
      p.progress = (p.progress + speed) % 1;
    });

    draw();
  }

  function draw() {
    if (!ctx || !canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W   = canvas.width  / dpr;
    const H   = canvas.height / dpr;

    ctx.clearRect(0, 0, W, H);

    const pad  = 50;
    const midY = H / 2;

    // ── Grade de fundo ──
    ctx.strokeStyle = 'rgba(30, 58, 95, 0.3)';
    ctx.lineWidth   = 1;
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // ── Fios ──
    ctx.strokeStyle = '#2a5298';
    ctx.lineWidth   = 3;
    ctx.lineJoin    = 'round';

    // Retângulo do circuito
    ctx.beginPath();
    ctx.moveTo(pad, midY - 50);
    ctx.lineTo(W - pad, midY - 50);  // Fio superior
    ctx.lineTo(W - pad, midY + 50);  // Fio direito
    ctx.lineTo(pad, midY + 50);      // Fio inferior
    ctx.lineTo(pad, midY - 50);      // Fio esquerdo
    ctx.stroke();

    // ── Bateria (esquerda) ──
    drawBattery(ctx, pad, midY - 50, midY + 50, state.voltage);

    // ── Resistor (fio superior, lado esquerdo) ──
    const resX = pad + 80;
    drawResistor(ctx, resX, midY - 50, 100, state.resistance);

    // ── Lâmpada (fio superior, lado direito) ──
    const lampX = W - pad - 140;
    drawLamp(ctx, lampX, midY - 50, state.brightness);

    // ── Queda de tensão nos componentes ──
    drawVoltageLabel(ctx, resX + 50, midY - 75,
      `${UI.formatNumber(state.current * state.resistance, 1)}V`);

    const lampR = 100; // valor simbólico para a lâmpada
    drawVoltageLabel(ctx, lampX + 50, midY - 75,
      `${UI.formatNumber(state.voltage - state.current * state.resistance, 1)}V`);

    // ── Partículas ──
    particles.forEach(p => {
      const pos = getCircuitPos(p.progress, pad, W - pad, midY - 50, midY + 50);
      drawParticle(ctx, pos.x, pos.y, p.size, state.brightness);
    });
  }

  function getCircuitPos(t, x1, x2, y1, y2) {
    const w = x2 - x1;
    const h = y2 - y1;
    const perim = 2 * (w + h);
    const dist  = t * perim;

    if (dist < w) return { x: x1 + dist, y: y1 };
    const d2 = dist - w;
    if (d2 < h) return { x: x2, y: y1 + d2 };
    const d3 = d2 - h;
    if (d3 < w) return { x: x2 - d3, y: y2 };
    const d4 = d3 - w;
    return { x: x1, y: y2 - d4 };
  }

  function drawParticle(ctx, x, y, size, brightness) {
    const alpha = 0.6 + brightness * 0.4;
    const r = Math.floor(0   + brightness * 80);
    const g = Math.floor(180 + brightness * 75);
    const b = 255;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, size * 2.5);
    grad.addColorStop(0,   `rgba(${r},${g},${b},${alpha})`);
    grad.addColorStop(0.5, `rgba(${r},${g},${b},${alpha * 0.4})`);
    grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);

    ctx.beginPath();
    ctx.arc(x, y, size * 2.5, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fill();
  }

  function drawBattery(ctx, x, y1, y2, voltage) {
    const cx = x;
    const cy = (y1 + y2) / 2;

    ctx.fillStyle   = '#0f2a1a';
    ctx.strokeStyle = '#2a7a4a';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.roundRect(cx - 14, cy - 28, 28, 56, 4);
    ctx.fill();
    ctx.stroke();

    // Células
    ctx.strokeStyle = '#4aaa6a';
    ctx.lineWidth   = 2.5;
    [cy - 10, cy + 10].forEach(ly => {
      ctx.beginPath();
      ctx.moveTo(cx - 9, ly);
      ctx.lineTo(cx + 9, ly);
      ctx.stroke();
    });

    // Terminal + acima
    ctx.strokeStyle = '#ff6666';
    ctx.lineWidth   = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy - 18);
    ctx.lineTo(cx + 6, cy - 18);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - 22);
    ctx.lineTo(cx, cy - 14);
    ctx.stroke();

    // Rótulo
    ctx.fillStyle  = '#60a5fa';
    ctx.font       = 'bold 12px Space Mono, monospace';
    ctx.textAlign  = 'center';
    ctx.fillText(`${voltage}V`, cx, cy + 44);
  }

  function drawResistor(ctx, x, wireY, width, value) {
    const rW = 70;
    const rH = 22;
    const rx  = x + (width - rW) / 2;
    const ry  = wireY - rH / 2;

    // Fios
    ctx.strokeStyle = '#2a5298';
    ctx.lineWidth   = 3;
    ctx.beginPath();
    ctx.moveTo(x, wireY);
    ctx.lineTo(rx, wireY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rx + rW, wireY);
    ctx.lineTo(x + width, wireY);
    ctx.stroke();

    // Corpo
    ctx.fillStyle   = '#7c3d1a';
    ctx.strokeStyle = '#c47a3a';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.roundRect(rx, ry, rW, rH, 3);
    ctx.fill();
    ctx.stroke();

    // Faixas
    ['#ffaa00', '#ff6600', '#996633'].forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect(rx + 10 + i * 17, ry + 3, 10, rH - 6);
    });

    // Rótulo
    ctx.fillStyle = '#94a3b8';
    ctx.font      = '11px Space Grotesk, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`R = ${value}Ω`, rx + rW / 2, ry - 7);
  }

  function drawLamp(ctx, x, wireY, brightness) {
    const centerX = x + 50;
    const centerY = wireY;
    const radius  = 18;

    // Fios
    ctx.strokeStyle = '#2a5298';
    ctx.lineWidth   = 3;
    ctx.beginPath();
    ctx.moveTo(x, wireY);
    ctx.lineTo(centerX - radius, wireY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX + radius, wireY);
    ctx.lineTo(x + 100, wireY);
    ctx.stroke();

    // Aura de luz (proporcional ao brilho)
    if (brightness > 0.05) {
      const auraRadius = radius * (1 + brightness * 3);
      const aura = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, auraRadius);
      const alpha = brightness * 0.5;
      aura.addColorStop(0,   `rgba(255, 200, 50, ${alpha})`);
      aura.addColorStop(0.5, `rgba(255, 150, 0,  ${alpha * 0.5})`);
      aura.addColorStop(1,   `rgba(255, 100, 0,  0)`);
      ctx.beginPath();
      ctx.arc(centerX, centerY, auraRadius, 0, Math.PI * 2);
      ctx.fillStyle = aura;
      ctx.fill();
    }

    // Bulbo da lâmpada
    const lampColor = brightness > 0.05
      ? `rgba(${Math.floor(200 + brightness * 55)}, ${Math.floor(150 + brightness * 50)}, ${Math.floor(50 * brightness)}, 0.9)`
      : 'rgba(50, 60, 80, 0.9)';

    ctx.fillStyle   = lampColor;
    ctx.strokeStyle = brightness > 0.05 ? '#ffcc44' : '#2a5298';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Filamento
    ctx.strokeStyle = brightness > 0.05 ? '#ffffff' : '#475569';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(centerX - 6, centerY + 5);
    ctx.quadraticCurveTo(centerX, centerY - 8, centerX + 6, centerY + 5);
    ctx.stroke();

    // Rótulo
    ctx.fillStyle = '#94a3b8';
    ctx.font      = '11px Space Grotesk, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(brightness * 100)}%`, centerX, centerY + radius + 15);
  }

  function drawVoltageLabel(ctx, x, y, text) {
    ctx.fillStyle = '#f59e0b';
    ctx.font      = '11px Space Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('↓ ' + text, x, y);
  }

  // ── DESTRUIÇÃO ─────────────────────────────────────────────

  function destroy() {
    if (animationId) cancelAnimationFrame(animationId);
  }

  return { init, destroy };

})();
