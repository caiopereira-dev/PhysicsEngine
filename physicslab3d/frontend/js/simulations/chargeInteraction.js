/**
 * chargeInteraction.js — Interação Entre Cargas (Lei de Coulomb)
 *
 * Visualiza a força de atração e repulsão entre duas cargas.
 * Mostra:
 *   - Duas esferas representando as cargas q1 e q2
 *   - Vetores de força em cada carga (setas)
 *   - Linha conectando as cargas com intensidade proporcional à força
 *   - Animação de vibração quando as forças são grandes
 *   - Campo de linhas ao redor de ambas
 *
 * Fórmula: F = k × |q1 × q2| / r²
 */

const ChargeInteractionSimulation = (() => {

  // ── Estado ────────────────────────────────────────────────────
  let state = {
    q1: { value:  5e-9, sign: 'positive' },  // 5 nanocoulombs positivo
    q2: { value: -5e-9, sign: 'negative' },  // 5 nanocoulombs negativo
    distance: 1.0,       // metros (escala real)
    force: 0,
    interaction: 'atracao'
  };

  // ── Three.js ─────────────────────────────────────────────────
  let scene, camera, renderer, animationId;
  let mesh1, mesh2, aura1, aura2, light1, light2;
  let forceArrow1, forceArrow2, connectionLine;
  let particlesGroup;

  // Órbita da câmera
  let isDragging = false;
  let prevMouse  = { x: 0, y: 0 };
  let cameraTheta = 0;
  let cameraPhi   = Math.PI / 3;
  let cameraRadius = 10;

  // Animação de pulso das forças
  let time = 0;

  // ── INICIALIZAÇÃO ─────────────────────────────────────────────

  function init() {
    setupThreeJS();
    setupUI();
    rebuildScene();
    calcForce();
    animate();
  }

  // ── THREE.JS SETUP ────────────────────────────────────────────

  function setupThreeJS() {
    const canvas = document.getElementById('canvas-charges');
    if (!canvas) return;

    const w = canvas.clientWidth  || 700;
    const h = canvas.clientHeight || 520;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080d18);
    scene.fog = new THREE.FogExp2(0x080d18, 0.035);

    camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 200);
    updateCameraPosition();

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // Iluminação
    scene.add(new THREE.AmbientLight(0x112244, 3));

    // Grupo para partículas flutuantes de fundo
    particlesGroup = new THREE.Group();
    scene.add(particlesGroup);
    buildBackgroundParticles();

    // Controles de mouse
    canvas.addEventListener('mousedown', e => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; });
    canvas.addEventListener('mouseup',   () => { isDragging = false; });
    canvas.addEventListener('mousemove', e => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      cameraTheta -= dx * 0.008;
      cameraPhi    = Math.max(0.2, Math.min(Math.PI - 0.2, cameraPhi + dy * 0.008));
      prevMouse    = { x: e.clientX, y: e.clientY };
      updateCameraPosition();
    });
    canvas.addEventListener('wheel', e => {
      cameraRadius = Math.max(5, Math.min(25, cameraRadius + e.deltaY * 0.02));
      updateCameraPosition();
    }, { passive: true });

    window.addEventListener('resize', () => {
      const w2 = canvas.clientWidth;
      const h2 = canvas.clientHeight;
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
      renderer.setSize(w2, h2);
    });
  }

  function updateCameraPosition() {
    camera.position.x = cameraRadius * Math.sin(cameraPhi) * Math.sin(cameraTheta);
    camera.position.y = cameraRadius * Math.cos(cameraPhi);
    camera.position.z = cameraRadius * Math.sin(cameraPhi) * Math.cos(cameraTheta);
    camera.lookAt(0, 0, 0);
  }

  // ── SETUP DA INTERFACE ────────────────────────────────────────

  function setupUI() {
    // Tipo de q1
    document.getElementById('q1-positive')?.addEventListener('click', () => {
      state.q1.sign = 'positive';
      state.q1.value = Math.abs(state.q1.value);
      syncChargeButtons('q1', 'positive');
      rebuildScene();
      calcForce();
    });
    document.getElementById('q1-negative')?.addEventListener('click', () => {
      state.q1.sign = 'negative';
      state.q1.value = -Math.abs(state.q1.value);
      syncChargeButtons('q1', 'negative');
      rebuildScene();
      calcForce();
    });

    // Tipo de q2
    document.getElementById('q2-positive')?.addEventListener('click', () => {
      state.q2.sign = 'positive';
      state.q2.value = Math.abs(state.q2.value);
      syncChargeButtons('q2', 'positive');
      rebuildScene();
      calcForce();
    });
    document.getElementById('q2-negative')?.addEventListener('click', () => {
      state.q2.sign = 'negative';
      state.q2.value = -Math.abs(state.q2.value);
      syncChargeButtons('q2', 'negative');
      rebuildScene();
      calcForce();
    });

    // Magnitude q1
    UI.syncInputs('q1-magnitude', 'q1-magnitude-num', (val) => {
      const sign = state.q1.sign === 'positive' ? 1 : -1;
      state.q1.value = sign * val * 1e-9;
      calcForce();
    });

    // Magnitude q2
    UI.syncInputs('q2-magnitude', 'q2-magnitude-num', (val) => {
      const sign = state.q2.sign === 'positive' ? 1 : -1;
      state.q2.value = sign * val * 1e-9;
      calcForce();
    });

    // Distância
    UI.syncInputs('charge-distance', 'charge-distance-num', (val) => {
      state.distance = val;
      updateChargePositions();
      calcForce();
    });
  }

  function syncChargeButtons(which, sign) {
    document.getElementById(`${which}-positive`)?.classList.toggle('active', sign === 'positive');
    document.getElementById(`${which}-negative`)?.classList.toggle('active', sign === 'negative');
  }

  // ── CENA 3D ───────────────────────────────────────────────────

  function rebuildScene() {
    // Remove meshes existentes
    [mesh1, mesh2, aura1, aura2, light1, light2, forceArrow1, forceArrow2, connectionLine]
      .forEach(obj => { if (obj) scene.remove(obj); });

    const color1 = state.q1.value > 0 ? 0xff3333 : 0x3399ff;
    const color2 = state.q2.value > 0 ? 0xff3333 : 0x3399ff;

    // ── Carga 1 ──
    const geo1 = new THREE.SphereGeometry(0.5, 32, 32);
    const mat1 = new THREE.MeshStandardMaterial({
      color:            color1,
      emissive:         color1,
      emissiveIntensity: 0.6,
      roughness: 0.15,
      metalness: 0.4
    });
    mesh1 = new THREE.Mesh(geo1, mat1);

    // ── Carga 2 ──
    const geo2 = new THREE.SphereGeometry(0.5, 32, 32);
    const mat2 = new THREE.MeshStandardMaterial({
      color:            color2,
      emissive:         color2,
      emissiveIntensity: 0.6,
      roughness: 0.15,
      metalness: 0.4
    });
    mesh2 = new THREE.Mesh(geo2, mat2);

    // Auras (halos de luz)
    aura1 = buildAura(0.8, color1);
    aura2 = buildAura(0.8, color2);
    mesh1.add(aura1);
    mesh2.add(aura2);

    // Luzes pontuais nas cargas
    light1 = new THREE.PointLight(color1, 2, 8);
    light2 = new THREE.PointLight(color2, 2, 8);
    mesh1.add(light1);
    mesh2.add(light2);

    scene.add(mesh1);
    scene.add(mesh2);

    // Rótulos visuais
    addSignLabel(mesh1, state.q1.value > 0 ? '+' : '−', color1);
    addSignLabel(mesh2, state.q2.value > 0 ? '+' : '−', color2);

    updateChargePositions();
    buildConnectionLine();
    buildForceArrows();
  }

  function buildAura(radius, color) {
    const geo = new THREE.SphereGeometry(radius, 16, 16);
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    });
    return new THREE.Mesh(geo, mat);
  }

  function addSignLabel(parentMesh, sign, color) {
    // Cria uma pequena esfera acima da carga para indicar o sinal
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff, emissive: 0xffffff })
    );
    dot.position.set(0, 0.65, 0);
    parentMesh.add(dot);
  }

  function updateChargePositions() {
    // Separa as cargas simétricas em relação ao centro
    // Escala visual: distância real em metros → unidades Three.js
    const visualDist = state.distance * 2.5;

    if (mesh1) mesh1.position.set(-visualDist / 2, 0, 0);
    if (mesh2) mesh2.position.set( visualDist / 2, 0, 0);

    buildConnectionLine();
    buildForceArrows();
  }

  function buildConnectionLine() {
    if (connectionLine) scene.remove(connectionLine);
    if (!mesh1 || !mesh2) return;

    const isAttraction = state.q1.value * state.q2.value < 0;
    const lineColor    = isAttraction ? 0xaa44ff : 0xffaa00;

    const points  = [mesh1.position.clone(), mesh2.position.clone()];
    const geo     = new THREE.BufferGeometry().setFromPoints(points);
    const mat     = new THREE.LineDashedMaterial({
      color:       lineColor,
      dashSize:    0.3,
      gapSize:     0.2,
      transparent: true,
      opacity:     0.5
    });
    connectionLine = new THREE.Line(geo, mat);
    connectionLine.computeLineDistances();
    scene.add(connectionLine);
  }

  // ── SETAS DE FORÇA ────────────────────────────────────────────

  function buildForceArrows() {
    if (forceArrow1) scene.remove(forceArrow1);
    if (forceArrow2) scene.remove(forceArrow2);
    if (!mesh1 || !mesh2) return;

    const isAttraction = state.q1.value * state.q2.value < 0;

    // Direção das forças
    // Atração: cada carga aponta em direção à outra
    // Repulsão: cada carga aponta afastando-se da outra

    const dx    = mesh2.position.x - mesh1.position.x;
    const dir1  = new THREE.Vector3(isAttraction ?  dx : -dx, 0, 0).normalize();
    const dir2  = new THREE.Vector3(isAttraction ? -dx :  dx, 0, 0).normalize();
    const color = isAttraction ? 0xaa44ff : 0xffaa00;

    forceArrow1 = buildArrow3D(mesh1.position.clone(), dir1, 1.5, color);
    forceArrow2 = buildArrow3D(mesh2.position.clone(), dir2, 1.5, color);

    scene.add(forceArrow1);
    scene.add(forceArrow2);
  }

  function buildArrow3D(origin, direction, length, color) {
    const group = new THREE.Group();
    const mat   = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.8 });

    // Haste
    const shaftLen = length * 0.7;
    const shaft    = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, shaftLen, 8),
      mat
    );
    shaft.position.copy(direction.clone().multiplyScalar(0.7 + shaftLen / 2));
    shaft.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    group.add(shaft);

    // Cone (ponta)
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.1, length * 0.3, 8),
      mat.clone()
    );
    cone.position.copy(direction.clone().multiplyScalar(0.7 + shaftLen + length * 0.15));
    cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    group.add(cone);

    group.position.copy(origin);
    return group;
  }

  // ── PARTÍCULAS DE FUNDO ───────────────────────────────────────

  function buildBackgroundParticles() {
    const positions = [];
    for (let i = 0; i < 200; i++) {
      positions.push(
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 25
      );
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    particlesGroup.add(new THREE.Points(geo,
      new THREE.PointsMaterial({ color: 0x1a3a6f, size: 0.05 })
    ));
  }

  // ── CÁLCULO DE FORÇA ─────────────────────────────────────────

  async function calcForce() {
    const q1 = state.q1.value;
    const q2 = state.q2.value;
    const d  = state.distance;

    try {
      const data = await API.calcChargeForce(q1, q2, d);
      state.force       = data.force;
      state.interaction = data.interaction;
      updateForceDisplay(data.force, data.interaction);

    } catch {
      // Cálculo local
      const K    = 8.9875e9;
      const force = K * Math.abs(q1 * q2) / (d * d);
      const interaction = (q1 * q2 < 0) ? 'atracao' : 'repulsao';

      state.force       = force;
      state.interaction = interaction;
      updateForceDisplay(force, interaction);
    }

    buildConnectionLine();
    buildForceArrows();
  }

  function updateForceDisplay(force, interaction) {
    UI.setText('charge-force', UI.formatScientific(force, 3) + ' N');

    const typeEl = document.getElementById('interaction-type');
    if (typeEl) {
      typeEl.textContent = interaction === 'atracao' ? '🟣 Atração' : '🟡 Repulsão';
      typeEl.className   = 'result-card-value ' + interaction;
    }
  }

  // ── LOOP DE ANIMAÇÃO ─────────────────────────────────────────

  function animate() {
    animationId = requestAnimationFrame(animate);
    time += 0.015;

    // Pulsa as cargas
    if (mesh1) {
      const s = 1 + Math.sin(time * 2) * 0.06;
      mesh1.scale.setScalar(s);
    }
    if (mesh2) {
      const s = 1 + Math.sin(time * 2 + Math.PI) * 0.06;
      mesh2.scale.setScalar(s);
    }

    // Intensidade das luzes varia com o tempo
    const intensity = 1.5 + Math.sin(time * 3) * 0.5;
    if (light1) light1.intensity = intensity;
    if (light2) light2.intensity = intensity;

    // Rotação suave da conexão (linha tracejada animada)
    if (connectionLine) {
      // não há rotação nativa de linha tracejada, mas podemos animar a opacidade
      const lineOp = 0.3 + Math.abs(Math.sin(time * 2)) * 0.4;
      if (connectionLine.material) connectionLine.material.opacity = lineOp;
    }

    // Anima as setas de força (pulsa o comprimento via escala)
    const forceScale = 1 + Math.sin(time * 4) * 0.08;
    if (forceArrow1) forceArrow1.scale.setScalar(forceScale);
    if (forceArrow2) forceArrow2.scale.setScalar(forceScale);

    // Rotação lenta da câmera de fundo (parallax suave)
    particlesGroup.rotation.y = time * 0.02;

    renderer.render(scene, camera);
  }

  // ── DESTRUIÇÃO ────────────────────────────────────────────────

  function destroy() {
    if (animationId) cancelAnimationFrame(animationId);
    if (renderer)    renderer.dispose();
  }

  return { init, destroy };

})();
