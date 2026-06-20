/**
 * ohmLaw.js — Simulação da Lei de Ohm
 *
 * Controla os inputs do painel, chama a API do backend
 * para calcular os valores e renderiza o circuito animado com Three.js.
 *
 * O circuito mostra:
 * - Uma fonte (bateria)
 * - Um resistor
 * - Partículas animadas representando o fluxo de corrente
 * - Cores indicando a intensidade
 */

const OhmSimulation = (() => {

  // Estado atual da simulação
  let state = {
    voltage:    12,
    resistance:  4,
    current:     3,
    power:      36,
  };

  // Objetos Three.js
  let scene, camera, renderer, animationId;
  let particles = [];
  let currentIntensity = 1; // Escala de velocidade das partículas

  // ── INICIALIZAÇÃO ──────────────────────────────────────────

  function init() {
    setupInputs();
    setupThreeJS();
    buildCircuit();
    animate();
    updateFromBackend();
  }

  // ── CONTROLES DE INPUT ─────────────────────────────────────

  function setupInputs() {
    // Sincroniza sliders com campos numéricos
    UI.syncInputs('ohm-voltage', 'ohm-voltage-num', (val) => {
      state.voltage = val;
      updateFromBackend();
    });

    UI.syncInputs('ohm-resistance', 'ohm-resistance-num', (val) => {
      state.resistance = val;
      updateFromBackend();
    });
  }

  // ── COMUNICAÇÃO COM BACKEND ────────────────────────────────

  async function updateFromBackend() {
    try {
      const data = await API.calcOhm({
        voltage:    state.voltage,
        resistance: state.resistance
      });

      state.current = data.current;
      state.power   = data.power;

      // Atualiza a interface
      UI.setText('val-v',      UI.formatNumber(data.voltage,    1));
      UI.setText('val-r',      UI.formatNumber(data.resistance, 1));
      UI.setText('val-i',      UI.formatNumber(data.current,    2));
      UI.setText('val-power',  UI.formatNumber(data.power,      1));

      document.getElementById('ohm-current-display').textContent =
        UI.formatNumber(data.current, 3) + ' A';

      // Atualiza a velocidade das partículas proporcional à corrente
      // Normaliza em relação ao máximo possível (50V / 1Ω = 50A)
      currentIntensity = Math.min(data.current / 10, 3);

    } catch (err) {
      // Se o backend não estiver disponível, calcula localmente
      state.current = state.voltage / state.resistance;
      state.power   = state.voltage * state.current;

      UI.setText('val-v',     UI.formatNumber(state.voltage,    1));
      UI.setText('val-r',     UI.formatNumber(state.resistance, 1));
      UI.setText('val-i',     UI.formatNumber(state.current,    2));
      UI.setText('val-power', UI.formatNumber(state.power,      1));

      document.getElementById('ohm-current-display').textContent =
        UI.formatNumber(state.current, 3) + ' A';

      currentIntensity = Math.min(state.current / 10, 3);
    }
  }

  // ── THREE.JS SETUP ─────────────────────────────────────────

  function setupThreeJS() {
    const canvas = document.getElementById('canvas-ohm');
    if (!canvas) return;

    const w = canvas.clientWidth  || 600;
    const h = canvas.clientHeight || 340;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e1a);

    camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
    camera.position.set(0, 0, 8);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio || 1);

    // Luz ambiente suave
    scene.add(new THREE.AmbientLight(0x334455, 2));

    // Luz direcional para dar profundidade
    const dirLight = new THREE.DirectionalLight(0x6699ff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // Redimensiona com a janela
    window.addEventListener('resize', () => {
      const w2 = canvas.clientWidth;
      const h2 = canvas.clientHeight;
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
      renderer.setSize(w2, h2);
    });
  }

  // ── CONSTRUÇÃO DO CIRCUITO ─────────────────────────────────

  function buildCircuit() {
    if (!scene) return;

    // Materiais
    const wireMat     = new THREE.MeshStandardMaterial({ color: 0x334455, roughness: 0.3 });
    const batteryMat  = new THREE.MeshStandardMaterial({ color: 0x1a3a2a, roughness: 0.4, metalness: 0.5 });
    const resistorMat = new THREE.MeshStandardMaterial({ color: 0x7c3d1a, roughness: 0.5 });
    const terminalPos = new THREE.MeshStandardMaterial({ color: 0xff4444, emissive: 0x441111 });
    const terminalNeg = new THREE.MeshStandardMaterial({ color: 0x4488ff, emissive: 0x111144 });

    // ── Fios do circuito (retângulo) ──
    const wireRadius = 0.06;
    const wireGeo    = (len, axis) => {
      const g = new THREE.CylinderGeometry(wireRadius, wireRadius, len, 8);
      if (axis === 'x') g.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
      if (axis === 'z') g.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
      return g;
    };

    // Fio superior
    addMesh(new THREE.CylinderGeometry(wireRadius, wireRadius, 8, 8)
      .applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI/2)), wireMat, 0, 2, 0);
    // Fio inferior
    addMesh(new THREE.CylinderGeometry(wireRadius, wireRadius, 8, 8)
      .applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI/2)), wireMat, 0, -2, 0);
    // Fio esquerdo
    addMesh(new THREE.CylinderGeometry(wireRadius, wireRadius, 4, 8), wireMat, -4, 0, 0);
    // Fio direito
    addMesh(new THREE.CylinderGeometry(wireRadius, wireRadius, 4, 8), wireMat,  4, 0, 0);

    // ── Bateria (lado esquerdo) ──
    addMesh(new THREE.CylinderGeometry(0.4, 0.4, 1.6, 16), batteryMat, -4, 0, 0);
    // Terminal + (vermelho, acima)
    addMesh(new THREE.CylinderGeometry(0.18, 0.18, 0.25, 12), terminalPos, -4, 0.95, 0);
    // Terminal − (azul, abaixo)
    addMesh(new THREE.CylinderGeometry(0.25, 0.25, 0.1, 12), terminalNeg, -4, -0.9, 0);

    // ── Resistor (lado direito) ──
    addMesh(new THREE.BoxGeometry(0.5, 1.4, 0.5), resistorMat, 4, 0, 0);
    // Linhas decorativas no resistor (como as faixas coloridas reais)
    const stripMat = [
      new THREE.MeshStandardMaterial({ color: 0xffaa00 }),
      new THREE.MeshStandardMaterial({ color: 0xff6600 }),
      new THREE.MeshStandardMaterial({ color: 0x996633 }),
    ];
    [-0.35, 0, 0.35].forEach((y, i) => {
      addMesh(new THREE.BoxGeometry(0.55, 0.12, 0.55), stripMat[i], 4, y, 0);
    });

    // ── Partículas de corrente ──
    createParticles();

    // Rótulos flutuantes (pontos de referência visual)
    addLabel(scene, -4.8, 0.7, 0, '+', 0xff4444);
    addLabel(scene, -4.8, -0.7, 0, '−', 0x4488ff);
  }

  // Atalho para adicionar mesh à cena
  function addMesh(geometry, material, x, y, z) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    return mesh;
  }

  // Adiciona um ponto de cor (como um sprite de texto simples)
  function addLabel(scene, x, y, z, text, color) {
    const geo  = new THREE.SphereGeometry(0.12, 8, 8);
    const mat  = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.8 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    scene.add(mesh);
  }

  // ── PARTÍCULAS ─────────────────────────────────────────────

  function createParticles() {
    // Remove partículas antigas
    particles.forEach(p => scene.remove(p.mesh));
    particles = [];

    const particleMat = new THREE.MeshStandardMaterial({
      color:    0x00ccff,
      emissive: 0x006688,
      emissiveIntensity: 1.5,
      roughness: 0
    });

    // Cria 30 partículas distribuídas ao longo do circuito
    for (let i = 0; i < 30; i++) {
      const geo  = new THREE.SphereGeometry(0.1, 6, 6);
      const mesh = new THREE.Mesh(geo, particleMat.clone());
      scene.add(mesh);

      // Posição inicial: distribuída uniformemente no caminho
      const progress = i / 30;
      const pos = getCircuitPosition(progress);
      mesh.position.set(pos.x, pos.y, pos.z);

      particles.push({ mesh, progress });
    }
  }

  /**
   * Calcula a posição (x, y) ao longo do circuito retangular.
   * O circuito é um retângulo: top → right → bottom → left
   * progress vai de 0 a 1 percorrendo o circuito inteiro.
   */
  function getCircuitPosition(t) {
    // Normaliza t entre 0 e 1 (loop)
    t = ((t % 1) + 1) % 1;

    const top    = 2;    // y do fio superior
    const bottom = -2;   // y do fio inferior
    const right  =  3.7; // x do fio direito
    const left   = -3.7; // x do fio esquerdo
    const h = 4;  // altura do retângulo
    const w = 7.4; // largura

    const perimeter = 2 * (w + h);
    const dist = t * perimeter;

    // Segmento 1: esquerda de baixo para cima (corre pela bateria)
    if (dist < h) {
      return { x: left, y: bottom + dist, z: 0 };
    }
    // Segmento 2: topo, da esquerda para a direita
    const d2 = dist - h;
    if (d2 < w) {
      return { x: left + d2, y: top, z: 0 };
    }
    // Segmento 3: direita de cima para baixo (corre pelo resistor)
    const d3 = d2 - w;
    if (d3 < h) {
      return { x: right, y: top - d3, z: 0 };
    }
    // Segmento 4: fundo, da direita para a esquerda
    const d4 = d3 - h;
    return { x: right - d4, y: bottom, z: 0 };
  }

  // ── LOOP DE ANIMAÇÃO ───────────────────────────────────────

  function animate() {
    animationId = requestAnimationFrame(animate);

    // Move as partículas ao longo do circuito
    const speed = 0.0008 * (1 + currentIntensity);

    particles.forEach(p => {
      p.progress += speed;
      const pos = getCircuitPosition(p.progress);
      p.mesh.position.set(pos.x, pos.y, pos.z);

      // Cor varia com a intensidade da corrente
      const intensity = Math.min(currentIntensity / 3, 1);
      const r = Math.floor(0   + intensity * 255);
      const g = Math.floor(204 - intensity * 100);
      const b = 255;
      p.mesh.material.color.setRGB(r/255, g/255, b/255);
      p.mesh.material.emissiveIntensity = 0.5 + intensity * 2;
    });

    // Rotação suave da câmera para dar sensação 3D
    const time = Date.now() * 0.0003;
    camera.position.x = Math.sin(time) * 0.5;
    camera.position.y = Math.cos(time * 0.7) * 0.3;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  // ── DESTRUIÇÃO ─────────────────────────────────────────────

  function destroy() {
    if (animationId) cancelAnimationFrame(animationId);
    if (renderer)    renderer.dispose();
  }

  // ── API PÚBLICA ─────────────────────────────────────────────
  return { init, destroy };

})();
