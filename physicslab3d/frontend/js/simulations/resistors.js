/**
 * resistors.js — Simulação de Associação de Resistores
 *
 * Gerencia os resistores em série e paralelo.
 * Desenha o diagrama do circuito em um canvas 2D (mais didático que 3D aqui).
 * Comunica com o backend para calcular os valores.
 */

const ResistorsSimulation = (() => {

  // Estado da simulação
  let state = {
    mode: 'series',    // 'series' ou 'parallel'
    voltage: 12,
    resistors: [10, 20, 15]  // Valores iniciais dos resistores
  };

  let canvas, ctx;
  let animationId;
  let particleProgress = 0; // Para animar o fluxo de corrente

  // ── INICIALIZAÇÃO ──────────────────────────────────────────

  function init() {
    canvas = document.getElementById('canvas-resistors');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    setupSize();
    setupInputs();
    renderResistorList();
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
    // Modo série / paralelo
    document.getElementById('btn-series')?.addEventListener('click', () => setMode('series'));
    document.getElementById('btn-parallel')?.addEventListener('click', () => setMode('parallel'));

    // Tensão
    UI.syncInputs('res-voltage', 'res-voltage-num', (val) => {
      state.voltage = val;
      update();
    });

    // Botão de adicionar resistor
    document.getElementById('add-resistor-btn')?.addEventListener('click', () => {
      if (state.resistors.length >= 6) {
        UI.showToast('Máximo de 6 resistores atingido.', 'warning');
        return;
      }
      state.resistors.push(10);
      renderResistorList();
      update();
    });
  }

  function setMode(mode) {
    state.mode = mode;

    document.getElementById('btn-series')?.classList.toggle('active',   mode === 'series');
    document.getElementById('btn-parallel')?.classList.toggle('active', mode === 'parallel');

    update();
  }

  // ── LISTA DE RESISTORES ────────────────────────────────────

  function renderResistorList() {
    const container = document.getElementById('resistor-list');
    if (!container) return;

    container.innerHTML = '';

    state.resistors.forEach((val, index) => {
      const item = document.createElement('div');
      item.className = 'resistor-item';

      item.innerHTML = `
        <span class="resistor-label">R${index + 1}</span>
        <input class="resistor-input" type="number" value="${val}" min="1" max="1000" step="1"
               data-index="${index}" />
        <span class="resistor-unit">Ω</span>
        <button class="resistor-remove" data-index="${index}" title="Remover">×</button>
      `;

      container.appendChild(item);
    });

    // Eventos dos inputs de valor
    container.querySelectorAll('.resistor-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index);
        const val = parseFloat(e.target.value);
        if (!isNaN(val) && val > 0) {
          state.resistors[idx] = val;
          update();
        }
      });
    });

    // Eventos dos botões de remover
    container.querySelectorAll('.resistor-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.dataset.index);
        if (state.resistors.length <= 1) {
          UI.showToast('É preciso ter ao menos um resistor.', 'warning');
          return;
        }
        state.resistors.splice(idx, 1);
        renderResistorList();
        update();
      });
    });
  }

  // ── CÁLCULO E ATUALIZAÇÃO ──────────────────────────────────

  async function update() {
    const values  = [...state.resistors];
    const voltage = state.voltage;

    try {
      let data;
      if (state.mode === 'series') {
        data = await API.calcSeries(values, voltage);
      } else {
        data = await API.calcParallel(values, voltage);
      }

      // Atualiza cards de resultado
      UI.setText('res-equivalent', UI.formatNumber(data.equivalent, 2) + ' Ω');
      UI.setText('res-current',
        UI.formatNumber(data.current || data.totalCurrent, 3) + ' A');
      UI.setText('res-power',    UI.formatNumber(data.power, 2) + ' W');

    } catch (err) {
      // Cálculo local como fallback
      let eq;
      if (state.mode === 'series') {
        eq = state.resistors.reduce((a, b) => a + b, 0);
      } else {
        const sumInv = state.resistors.reduce((a, b) => a + 1/b, 0);
        eq = 1 / sumInv;
      }
      const current = voltage / eq;
      const power   = voltage * current;

      UI.setText('res-equivalent', UI.formatNumber(eq, 2) + ' Ω');
      UI.setText('res-current',    UI.formatNumber(current, 3) + ' A');
      UI.setText('res-power',      UI.formatNumber(power, 2) + ' W');
    }
  }

  // ── DESENHO DO CIRCUITO ────────────────────────────────────

  function animate() {
    animationId = requestAnimationFrame(animate);
    particleProgress = (particleProgress + 0.005) % 1;
    draw();
  }

  function draw() {
    if (!ctx || !canvas) return;

    const W = canvas.width  / (window.devicePixelRatio || 1);
    const H = canvas.height / (window.devicePixelRatio || 1);

    ctx.clearRect(0, 0, W, H);

    if (state.mode === 'series') {
      drawSeriesCircuit(W, H);
    } else {
      drawParallelCircuit(W, H);
    }
  }

  // ── CIRCUITO EM SÉRIE ──────────────────────────────────────

  function drawSeriesCircuit(W, H) {
    const n        = state.resistors.length;
    const padding  = 40;
    const wireY    = H / 2;
    const circuitW = W - padding * 2;

    // Posições dos componentes
    // Bateria no início, resistores distribuídos no resto
    const batteryX = padding + 50;
    const resStart = batteryX + 70;
    const resWidth = (circuitW - 120) / n;
    const resH     = 30;
    const resY     = wireY - resH / 2;

    // Estilo dos fios
    ctx.strokeStyle = '#2a5298';
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = 'round';

    // Fio superior completo
    ctx.beginPath();
    ctx.moveTo(padding, wireY - 40);
    ctx.lineTo(W - padding, wireY - 40);
    ctx.stroke();

    // Fio inferior completo
    ctx.beginPath();
    ctx.moveTo(padding, wireY + 40);
    ctx.lineTo(W - padding, wireY + 40);
    ctx.stroke();

    // Fio esquerdo (sobe da bateria)
    ctx.beginPath();
    ctx.moveTo(padding, wireY - 40);
    ctx.lineTo(padding, wireY + 40);
    ctx.stroke();

    // Fio direito
    ctx.beginPath();
    ctx.moveTo(W - padding, wireY - 40);
    ctx.lineTo(W - padding, wireY + 40);
    ctx.stroke();

    // ── Bateria ──
    drawBattery(ctx, padding + 5, wireY - 40, wireY + 40);

    // ── Resistores ──
    const resSpacing = (W - padding * 2 - 90) / n;
    for (let i = 0; i < n; i++) {
      const rx = padding + 80 + i * resSpacing + resSpacing / 2 - 25;
      drawResistor(ctx, rx, wireY - 40, 50, `R${i+1}`, state.resistors[i]);
    }

    // ── Partícula de corrente animada ──
    drawCurrentParticle(ctx, particleProgress, W, H, 'series');
  }

  // ── CIRCUITO EM PARALELO ───────────────────────────────────

  function drawParallelCircuit(W, H) {
    const n       = state.resistors.length;
    const padding = 40;
    const branchH = Math.min((H - 80) / n, 60);
    const totalH  = branchH * n;
    const startY  = (H - totalH) / 2;

    ctx.strokeStyle = '#2a5298';
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = 'round';

    // Barramentos verticais
    const busLeft  = padding + 60;
    const busRight = W - padding;

    // Barramento esquerdo
    ctx.beginPath();
    ctx.moveTo(busLeft, startY);
    ctx.lineTo(busLeft, startY + totalH);
    ctx.stroke();

    // Barramento direito
    ctx.beginPath();
    ctx.moveTo(busRight, startY);
    ctx.lineTo(busRight, startY + totalH);
    ctx.stroke();

    // Ramos com resistores
    for (let i = 0; i < n; i++) {
      const y = startY + i * branchH + branchH / 2;

      // Fio horizontal esquerdo
      ctx.beginPath();
      ctx.moveTo(busLeft, y);
      ctx.lineTo(busLeft + 40, y);
      ctx.stroke();

      // Resistor
      drawResistor(ctx, busLeft + 40, y, W - padding - busLeft - 80, `R${i+1}`, state.resistors[i]);

      // Fio horizontal direito
      ctx.beginPath();
      ctx.moveTo(W - padding - 40, y);
      ctx.lineTo(busRight, y);
      ctx.stroke();
    }

    // Bateria (lado esquerdo, fora dos barramentos)
    ctx.strokeStyle = '#2a5298';
    ctx.lineWidth   = 2.5;

    // Fio de volta
    ctx.beginPath();
    ctx.moveTo(padding + 5, startY);
    ctx.lineTo(busLeft, startY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(padding + 5, startY + totalH);
    ctx.lineTo(busLeft, startY + totalH);
    ctx.stroke();

    drawBattery(ctx, padding, startY, startY + totalH);

    // Partícula
    drawCurrentParticle(ctx, particleProgress, W, H, 'parallel');
  }

  // ── COMPONENTES GRÁFICOS ───────────────────────────────────

  function drawBattery(ctx, x, y1, y2) {
    const cx = x + 20;
    const cy = (y1 + y2) / 2;

    // Corpo
    ctx.fillStyle = '#1a3a2a';
    ctx.strokeStyle = '#2a7a4a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cx - 12, cy - 24, 24, 48, 4);
    ctx.fill();
    ctx.stroke();

    // Linhas de célula
    ctx.strokeStyle = '#4aaa6a';
    ctx.lineWidth   = 2;

    [cy - 8, cy + 8].forEach(lineY => {
      ctx.beginPath();
      ctx.moveTo(cx - 8, lineY);
      ctx.lineTo(cx + 8, lineY);
      ctx.stroke();
    });

    // Terminal + (curto e grosso)
    ctx.strokeStyle = '#ff6666';
    ctx.lineWidth   = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy - 14);
    ctx.lineTo(cx + 6, cy - 14);
    ctx.stroke();

    // Rótulo V
    ctx.fillStyle   = '#6699ff';
    ctx.font        = 'bold 11px Space Mono, monospace';
    ctx.textAlign   = 'center';
    ctx.fillText(`${state.voltage}V`, cx, cy + 38);
  }

  function drawResistor(ctx, x, wireY, width, label, value) {
    const rW = Math.min(width * 0.6, 60);
    const rH = 20;
    const rx  = x + (width - rW) / 2;
    const ry  = wireY - rH / 2;

    // Fio de entrada
    ctx.strokeStyle = '#2a5298';
    ctx.lineWidth   = 2.5;
    ctx.beginPath();
    ctx.moveTo(x, wireY);
    ctx.lineTo(rx, wireY);
    ctx.stroke();

    // Fio de saída
    ctx.beginPath();
    ctx.moveTo(rx + rW, wireY);
    ctx.lineTo(x + width, wireY);
    ctx.stroke();

    // Corpo do resistor
    ctx.fillStyle   = '#7c3d1a';
    ctx.strokeStyle = '#c47a3a';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.roundRect(rx, ry, rW, rH, 3);
    ctx.fill();
    ctx.stroke();

    // Faixas coloridas
    const stripeColors = ['#ffaa00', '#ff6600', '#996633'];
    const stripeW = rW / 5;
    stripeColors.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect(rx + stripeW * (i + 1), ry + 2, stripeW * 0.6, rH - 4);
    });

    // Rótulo acima
    ctx.fillStyle  = '#94a3b8';
    ctx.font       = 'bold 11px Space Grotesk, sans-serif';
    ctx.textAlign  = 'center';
    ctx.fillText(label, rx + rW / 2, ry - 6);

    // Valor abaixo
    ctx.fillStyle  = '#f59e0b';
    ctx.font       = '10px Space Mono, monospace';
    ctx.fillText(`${value}Ω`, rx + rW / 2, ry + rH + 13);
  }

  function drawCurrentParticle(ctx, t, W, H, mode) {
    // Partícula simples no fio superior
    let px, py;
    if (mode === 'series') {
      const wireY = H / 2 - 40;
      px = 40 + t * (W - 80);
      py = wireY;
    } else {
      const n = state.resistors.length;
      const totalH = Math.min(60 * n, H - 80);
      const startY = (H - totalH) / 2;
      // Anima no barramento esquerdo descendo
      px = 100;
      py = startY + t * totalH;
    }

    // Efeito de brilho
    const gradient = ctx.createRadialGradient(px, py, 0, px, py, 8);
    gradient.addColorStop(0,   'rgba(0, 220, 255, 0.9)');
    gradient.addColorStop(0.5, 'rgba(0, 150, 255, 0.4)');
    gradient.addColorStop(1,   'rgba(0,  80, 255, 0)');

    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Núcleo
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#00eeff';
    ctx.fill();
  }

  // ── DESTRUIÇÃO ─────────────────────────────────────────────

  function destroy() {
    if (animationId) cancelAnimationFrame(animationId);
  }

  return { init, destroy };

})();
