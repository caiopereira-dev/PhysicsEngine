/**
 * electricField.js — Simulação de Campo Elétrico 3D
 *
 * Este é o módulo principal do projeto em termos de visualização.
 * Usa Three.js para renderizar:
 *   - Esferas representando cargas positivas (+) e negativas (-)
 *   - Linhas de campo elétrico saindo/entrando nas cargas
 *   - Vetores de campo em pontos do espaço
 *   - Grade de referência opcional
 *   - Controle de câmera com mouse (OrbitControls manual simples)
 *
 * Fórmula do campo: E = k × |q| / r²
 * Direção: afastando-se da carga positiva, em direção à negativa.
 */

const ElectricFieldSimulation = (() => {

  // ── Estado ──────────────────────────────────────────────────
  let state = {
    charges: [],          // Array de { id, value, x, y, z, mesh }
    nextId: 1,
    showFieldLines: true,
    showVectors: true,
    showGrid: false,
    selectedChargeType: 'positive',  // 'positive' ou 'negative'
    chargeMagnitude: 5,              // em nanocoulombs
  };

  // ── Three.js ────────────────────────────────────────────────
  let scene, camera, renderer, animationId;
  let fieldLinesGroup, vectorsGroup, gridGroup;

  // Controle de câmera manual (orbit simples)
  let isDragging = false;
  let prevMouse  = { x: 0, y: 0 };
  let cameraTheta = 0.4;  // ângulo horizontal
  let cameraPhi   = 0.8;  // ângulo vertical
  let cameraRadius = 14;

  // Constante de Coulomb (simplificada para escala visual)
  const K = 9e9;

  // ── INICIALIZAÇÃO ────────────────────────────────────────────

  function init() {
    setupThreeJS();
    setupControls();
    setupUI();
    // Adiciona uma carga positiva e uma negativa para começar
    addCharge(1, -2, 0, 0);   // +5nC à esquerda
    addCharge(-1, 2, 0, 0);   // -5nC à direita
    animate();
  }

  // ── THREE.JS SETUP ───────────────────────────────────────────

  function setupThreeJS() {
    const canvas = document.getElementById('canvas-field');
    if (!canvas) return;

    const w = canvas.clientWidth  || 700;
    const h = canvas.clientHeight || 520;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080d18);

    // Névoa leve para profundidade
    scene.fog = new THREE.FogExp2(0x080d18, 0.04);

    camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 200);
    updateCameraPosition();

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // Iluminação
    scene.add(new THREE.AmbientLight(0x112233, 3));
    const light1 = new THREE.DirectionalLight(0x4488ff, 2);
    light1.position.set(5, 10, 5);
    scene.add(light1);
    const light2 = new THREE.PointLight(0xff4433, 1, 20);
    light2.position.set(-5, 0, 0);
    scene.add(light2);

    // Grupos para organizar os objetos da cena
    fieldLinesGroup = new THREE.Group();
    vectorsGroup    = new THREE.Group();
    gridGroup       = new THREE.Group();
    scene.add(fieldLinesGroup);
    scene.add(vectorsGroup);
    scene.add(gridGroup);

    // Grade de pontos de fundo (estética de laboratório)
    buildBackgroundDots();

    // Redimensionamento
    window.addEventListener('resize', () => {
      const w2 = canvas.clientWidth;
      const h2 = canvas.clientHeight;
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
      renderer.setSize(w2, h2);
    });

    // Controles de mouse para orbitar a câmera
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup',   onMouseUp);
    canvas.addEventListener('wheel',     onWheel, { passive: true });

    // Touch (mobile)
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: true });
    canvas.addEventListener('touchend',   () => { isDragging = false; });
  }

  // ── CÂMERA ORBITAL ───────────────────────────────────────────

  function updateCameraPosition() {
    camera.position.x = cameraRadius * Math.sin(cameraPhi) * Math.sin(cameraTheta);
    camera.position.y = cameraRadius * Math.cos(cameraPhi);
    camera.position.z = cameraRadius * Math.sin(cameraPhi) * Math.cos(cameraTheta);
    camera.lookAt(0, 0, 0);
  }

  function onMouseDown(e) { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; }
  function onMouseUp()    { isDragging = false; }

  function onMouseMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - prevMouse.x;
    const dy = e.clientY - prevMouse.y;
    cameraTheta -= dx * 0.008;
    cameraPhi    = Math.max(0.15, Math.min(Math.PI - 0.15, cameraPhi + dy * 0.008));
    prevMouse    = { x: e.clientX, y: e.clientY };
    updateCameraPosition();
  }

  function onWheel(e) {
    cameraRadius = Math.max(5, Math.min(30, cameraRadius + e.deltaY * 0.02));
    updateCameraPosition();
  }

  let touchPrev = null;
  function onTouchStart(e) { if (e.touches.length === 1) touchPrev = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }
  function onTouchMove(e) {
    if (!touchPrev || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - touchPrev.x;
    const dy = e.touches[0].clientY - touchPrev.y;
    cameraTheta -= dx * 0.01;
    cameraPhi    = Math.max(0.15, Math.min(Math.PI - 0.15, cameraPhi + dy * 0.01));
    touchPrev    = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    updateCameraPosition();
  }

  // ── CONTROLES DE UI ──────────────────────────────────────────

  function setupUI() {
    UI.syncInputs('charge-magnitude', 'charge-magnitude-num', (val) => {
      state.chargeMagnitude = val;
    });

    document.getElementById('btn-positive')?.addEventListener('click', () => {
      state.selectedChargeType = 'positive';
      document.getElementById('btn-positive')?.classList.add('active');
      document.getElementById('btn-negative')?.classList.remove('active');
    });

    document.getElementById('btn-negative')?.addEventListener('click', () => {
      state.selectedChargeType = 'negative';
      document.getElementById('btn-negative')?.classList.add('active');
      document.getElementById('btn-positive')?.classList.remove('active');
    });

    document.getElementById('add-charge-btn')?.addEventListener('click', () => {
      if (state.charges.length >= 8) {
        UI.showToast('Máximo de 8 cargas atingido.', 'warning');
        return;
      }
      // Posição aleatória próxima ao centro
      const sign = state.selectedChargeType === 'positive' ? 1 : -1;
      const mag  = state.chargeMagnitude * 1e-9; // converte nC para C
      const x = (Math.random() - 0.5) * 6;
      const y = (Math.random() - 0.5) * 4;
      const z = (Math.random() - 0.5) * 4;
      addCharge(sign * mag, x, y, z);
    });

    document.getElementById('clear-charges-btn')?.addEventListener('click', () => {
      clearAllCharges();
    });

    document.getElementById('show-field-lines')?.addEventListener('change', (e) => {
      state.showFieldLines = e.target.checked;
      fieldLinesGroup.visible = state.showFieldLines;
    });

    document.getElementById('show-vectors')?.addEventListener('change', (e) => {
      state.showVectors = e.target.checked;
      vectorsGroup.visible = state.showVectors;
    });

    document.getElementById('show-grid')?.addEventListener('change', (e) => {
      state.showGrid = e.target.checked;
      gridGroup.visible = state.showGrid;
      if (state.showGrid) buildGrid();
    });
  }

  // ── SETUP DE CONTROLES (botões já configurados em setupUI) ───

  function setupControls() {
    // buildGrid é preguiçosa — só constrói quando ativado
    gridGroup.visible = false;
  }

  // ── ADICIONAR / REMOVER CARGAS ───────────────────────────────

  function addCharge(value, x, y, z) {
    const id       = state.nextId++;
    const isPos    = value > 0;
    const color    = isPos ? 0xff3333 : 0x3399ff;
    const emissive = isPos ? 0x660000 : 0x001144;

    // Esfera da carga
    const geo  = new THREE.SphereGeometry(0.35, 24, 24);
    const mat  = new THREE.MeshStandardMaterial({
      color,
      emissive,
      emissiveIntensity: 1.5,
      roughness: 0.2,
      metalness: 0.5
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    scene.add(mesh);

    // Aura brilhante ao redor da carga
    const auraGeo = new THREE.SphereGeometry(0.55, 16, 16);
    const auraMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide
    });
    const aura = new THREE.Mesh(auraGeo, auraMat);
    mesh.add(aura);

    // Luz pontual emanando da carga
    const pointLight = new THREE.PointLight(color, 0.8, 6);
    mesh.add(pointLight);

    const charge = { id, value, x, y, z, mesh };
    state.charges.push(charge);

    rebuildFieldVisualization();
    updateChargeList();

    UI.showToast(
      `Carga ${isPos ? 'positiva' : 'negativa'} adicionada (${isPos ? '+' : ''}${(value * 1e9).toFixed(0)} nC)`,
      isPos ? 'error' : 'info'
    );
  }

  function removeCharge(id) {
    const idx = state.charges.findIndex(c => c.id === id);
    if (idx === -1) return;

    const charge = state.charges[idx];
    scene.remove(charge.mesh);
    charge.mesh.geometry.dispose();

    state.charges.splice(idx, 1);
    rebuildFieldVisualization();
    updateChargeList();
  }

  function clearAllCharges() {
    state.charges.forEach(c => {
      scene.remove(c.mesh);
      c.mesh.geometry.dispose();
    });
    state.charges = [];
    rebuildFieldVisualization();
    updateChargeList();
  }

  // ── LISTA DE CARGAS NA UI ────────────────────────────────────

  function updateChargeList() {
    const container = document.getElementById('charge-list');
    if (!container) return;

    container.innerHTML = '';

    if (state.charges.length === 0) {
      container.innerHTML = '<span style="color:#475569;font-size:12px">Nenhuma carga adicionada</span>';
      return;
    }

    state.charges.forEach(charge => {
      const isPos = charge.value > 0;
      const magNC = Math.abs(charge.value * 1e9).toFixed(1);

      const item = document.createElement('div');
      item.className = 'charge-item';
      item.innerHTML = `
        <div class="charge-dot ${isPos ? 'pos' : 'neg'}"></div>
        <span class="charge-info">
          ${isPos ? '+' : '−'}${magNC} nC
          (${charge.x.toFixed(1)}, ${charge.y.toFixed(1)}, ${charge.z.toFixed(1)})
        </span>
        <button class="charge-remove" data-id="${charge.id}">×</button>
      `;
      container.appendChild(item);
    });

    container.querySelectorAll('.charge-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        removeCharge(parseInt(e.target.dataset.id));
      });
    });
  }

  // ── CAMPO ELÉTRICO ───────────────────────────────────────────

  /**
   * Calcula o vetor de campo elétrico total em um ponto (px, py, pz)
   * somando a contribuição de todas as cargas.
   * E_total = Σ k * q_i / r_i² * r̂_i
   */
  function calcFieldAt(px, py, pz) {
    let ex = 0, ey = 0, ez = 0;

    state.charges.forEach(charge => {
      const dx = px - charge.x;
      const dy = py - charge.y;
      const dz = pz - charge.z;
      const r2 = dx * dx + dy * dy + dz * dz;
      if (r2 < 0.01) return; // evita divisão por zero

      const r   = Math.sqrt(r2);
      // Intensidade: E = k|q|/r²  (q em nC para escala visual)
      const mag = K * Math.abs(charge.value) / r2;
      // Direção: afasta-se de positiva, atrai para negativa
      const sign = charge.value > 0 ? 1 : -1;

      ex += sign * mag * (dx / r);
      ey += sign * mag * (dy / r);
      ez += sign * mag * (dz / r);
    });

    return new THREE.Vector3(ex, ey, ez);
  }

  // ── RECONSTRUÇÃO DA VISUALIZAÇÃO ─────────────────────────────

  function rebuildFieldVisualization() {
    // Limpa grupos anteriores
    clearGroup(fieldLinesGroup);
    clearGroup(vectorsGroup);

    if (state.charges.length === 0) return;

    if (state.showFieldLines) buildFieldLines();
    if (state.showVectors)    buildVectors();
  }

  function clearGroup(group) {
    while (group.children.length > 0) {
      const child = group.children[0];
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
      group.remove(child);
    }
  }

  // ── LINHAS DE CAMPO ──────────────────────────────────────────

  function buildFieldLines() {
    // Para cada carga positiva, traça linhas de campo saindo em várias direções
    // Para cada carga negativa, as linhas terminam nelas

    const numLines      = 16;  // linhas por carga
    const numSteps      = 120; // passos por linha
    const stepSize      = 0.12;

    // Direções uniformemente distribuídas (pontos na esfera unitária)
    const directions = fibonacci_sphere(numLines);

    state.charges
      .filter(c => c.value > 0)  // Inicia nas cargas positivas
      .forEach(startCharge => {

        directions.forEach(dir => {
          // Ponto inicial: um pouco afastado da carga
          let pos = new THREE.Vector3(
            startCharge.x + dir.x * 0.5,
            startCharge.y + dir.y * 0.5,
            startCharge.z + dir.z * 0.5
          );

          const points = [pos.clone()];

          for (let step = 0; step < numSteps; step++) {
            const field = calcFieldAt(pos.x, pos.y, pos.z);
            const fMag  = field.length();

            if (fMag < 1e-6) break;

            // Avança na direção do campo (normalizado)
            field.divideScalar(fMag);
            pos = pos.clone().addScaledVector(field, stepSize);
            points.push(pos.clone());

            // Para se saiu muito longe do centro
            if (pos.length() > 12) break;

            // Para se chegou próximo de uma carga negativa
            const nearNeg = state.charges.some(c =>
              c.value < 0 && pos.distanceTo(new THREE.Vector3(c.x, c.y, c.z)) < 0.5
            );
            if (nearNeg) break;
          }

          if (points.length < 2) return;

          // Cria a linha com cor gradiente (azul → ciano → verde conforme intensidade)
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const material = new THREE.LineBasicMaterial({
            color: 0x00aaff,
            transparent: true,
            opacity: 0.55,
            linewidth: 1
          });
          const line = new THREE.Line(geometry, material);
          fieldLinesGroup.add(line);
        });
      });
  }

  /**
   * Gera N pontos distribuídos uniformemente na superfície de uma esfera
   * usando a sequência de Fibonacci.
   */
  function fibonacci_sphere(n) {
    const pts     = [];
    const golden  = Math.PI * (3 - Math.sqrt(5)); // ~2.399 rad
    for (let i = 0; i < n; i++) {
      const y     = 1 - (i / (n - 1)) * 2;
      const r     = Math.sqrt(1 - y * y);
      const theta = golden * i;
      pts.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r));
    }
    return pts;
  }

  // ── VETORES DE CAMPO ─────────────────────────────────────────

  function buildVectors() {
    // Grade de pontos no espaço onde mostraremos os vetores
    const range  = 4;
    const step   = 2;
    const maxMag = 5e11; // Para normalização visual

    for (let x = -range; x <= range; x += step) {
      for (let y = -range; y <= range; y += step) {
        for (let z = -range; z <= range; z += step) {
          // Não coloca vetor dentro de uma carga
          const nearCharge = state.charges.some(c =>
            Math.hypot(x - c.x, y - c.y, z - c.z) < 1.0
          );
          if (nearCharge) continue;

          const field = calcFieldAt(x, y, z);
          const mag   = field.length();
          if (mag < 1) continue;

          // Comprimento visual proporcional ao log da magnitude
          const visualLen = Math.min(Math.log10(mag + 1) * 0.3, 0.9);

          // Normaliza a direção
          field.normalize().multiplyScalar(visualLen);

          // Cria seta (cone + cilindro)
          const arrowGroup = buildArrow(field, visualLen);
          arrowGroup.position.set(x, y, z);

          // Cor: vermelho (forte) → amarelo → azul (fraco)
          const intensity = Math.min(mag / maxMag, 1);
          const r = Math.floor(intensity * 255);
          const g = Math.floor((1 - Math.abs(intensity - 0.5) * 2) * 200);
          const b = Math.floor((1 - intensity) * 255);
          arrowGroup.children.forEach(child => {
            if (child.material) child.material.color.setRGB(r/255, g/255, b/255);
          });

          vectorsGroup.add(arrowGroup);
        }
      }
    }
  }

  function buildArrow(direction, length) {
    const group = new THREE.Group();

    // Cilindro (haste)
    const shaftLen = length * 0.7;
    const shaftGeo = new THREE.CylinderGeometry(0.03, 0.03, shaftLen, 6);
    const mat      = new THREE.MeshStandardMaterial({ color: 0x00aaff, emissive: 0x004466 });
    const shaft    = new THREE.Mesh(shaftGeo, mat);
    shaft.position.y = shaftLen / 2;
    group.add(shaft);

    // Cone (ponta)
    const coneGeo = new THREE.ConeGeometry(0.07, length * 0.3, 8);
    const cone    = new THREE.Mesh(coneGeo, mat.clone());
    cone.position.y = shaftLen + length * 0.15;
    group.add(cone);

    // Orienta o grupo na direção do campo
    const axis = new THREE.Vector3(0, 1, 0);
    group.quaternion.setFromUnitVectors(axis, direction.clone().normalize());

    return group;
  }

  // ── GRADE DE REFERÊNCIA ──────────────────────────────────────

  function buildGrid() {
    if (gridGroup.children.length > 0) return; // Já foi construída

    const size   = 10;
    const step   = 1;
    const mat    = new THREE.LineBasicMaterial({ color: 0x1e3a5f, transparent: true, opacity: 0.4 });

    for (let i = -size; i <= size; i += step) {
      // Linhas horizontais
      const geoH = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-size, 0, i),
        new THREE.Vector3( size, 0, i)
      ]);
      gridGroup.add(new THREE.Line(geoH, mat));

      // Linhas verticais
      const geoV = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(i, 0, -size),
        new THREE.Vector3(i, 0,  size)
      ]);
      gridGroup.add(new THREE.Line(geoV, mat));
    }
  }

  // ── FUNDO COM PONTOS ─────────────────────────────────────────

  function buildBackgroundDots() {
    const positions = [];
    for (let i = 0; i < 300; i++) {
      positions.push(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30
      );
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0x1a3a6f, size: 0.06 });
    scene.add(new THREE.Points(geo, mat));
  }

  // ── LOOP DE ANIMAÇÃO ─────────────────────────────────────────

  let time = 0;

  function animate() {
    animationId = requestAnimationFrame(animate);
    time += 0.01;

    // Pulsa a aura das cargas
    state.charges.forEach((charge, i) => {
      const pulse = 1 + Math.sin(time * 2 + i) * 0.08;
      charge.mesh.scale.setScalar(pulse);
    });

    renderer.render(scene, camera);
  }

  // ── DESTRUIÇÃO ────────────────────────────────────────────────

  function destroy() {
    if (animationId) cancelAnimationFrame(animationId);
    if (renderer)    renderer.dispose();
  }

  return { init, destroy };

})();
