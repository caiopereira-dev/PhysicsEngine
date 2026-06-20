/**
 * main.js — Inicialização e Roteamento do PhysicsLab3D
 *
 * Este arquivo é o ponto de entrada da aplicação.
 * Responsável por:
 *   - Gerenciar qual módulo está ativo
 *   - Inicializar as simulações quando o módulo é aberto
 *   - Destruir a simulação anterior (libera memória do Three.js)
 *   - Inicializar o Modo Sala de Aula
 */

// ── Estado global da aplicação ────────────────────────────────
const App = {
  currentModule: null,       // Nome do módulo ativo
  activeSimulation: null,    // Instância da simulação ativa (com .destroy())

  // Mapeamento: nome do módulo → { sectionId, simulation }
  modules: {
    'ohm': {
      sectionId:  'module-ohm',
      simulation: OhmSimulation
    },
    'resistors': {
      sectionId:  'module-resistors',
      simulation: ResistorsSimulation
    },
    'circuits': {
      sectionId:  'module-circuits',
      simulation: CircuitsSimulation
    },
    'electric-field': {
      sectionId:  'module-electric-field',
      simulation: ElectricFieldSimulation
    },
    'charges': {
      sectionId:  'module-charges',
      simulation: ChargeInteractionSimulation
    }
  }
};

// ── INICIALIZAÇÃO ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  ClassroomMode.init();

  // Ativa o módulo padrão (Lei de Ohm)
  activateModule('ohm');

  // Indica que o lab está pronto
  console.log(
    '%c⚡ PhysicsLab3D carregado!',
    'color: #06b6d4; font-size: 16px; font-weight: bold;'
  );
});

// ── NAVEGAÇÃO ─────────────────────────────────────────────────

function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const moduleName = btn.dataset.module;
      if (moduleName && moduleName !== App.currentModule) {
        activateModule(moduleName);
      }
    });
  });
}

/**
 * Ativa um módulo pelo nome.
 *
 * 1. Destrói a simulação anterior (libera WebGL e animações)
 * 2. Esconde a seção anterior, mostra a nova
 * 3. Atualiza os botões de navegação
 * 4. Inicializa a nova simulação
 */
function activateModule(moduleName) {
  const module = App.modules[moduleName];
  if (!module) {
    console.warn(`Módulo desconhecido: ${moduleName}`);
    return;
  }

  // ── 1. Destrói a simulação atual ──
  if (App.activeSimulation && typeof App.activeSimulation.destroy === 'function') {
    App.activeSimulation.destroy();
    App.activeSimulation = null;
  }

  // ── 2. Alterna seções ──
  document.querySelectorAll('.module').forEach(section => {
    section.classList.remove('active');
  });

  const newSection = document.getElementById(module.sectionId);
  if (newSection) {
    newSection.classList.add('active');
  }

  // ── 3. Atualiza botões de navegação ──
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.module === moduleName);
  });

  // ── 4. Inicializa a simulação ──
  App.currentModule = moduleName;
  App.activeSimulation = module.simulation;

  // Espera um frame para o canvas ter as dimensões corretas
  requestAnimationFrame(() => {
    if (module.simulation && typeof module.simulation.init === 'function') {
      try {
        module.simulation.init();
      } catch (err) {
        console.error(`Erro ao inicializar módulo ${moduleName}:`, err);
      }
    }
  });

  // Rola para o topo da página
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── TRATAMENTO DE ERROS GLOBAIS ───────────────────────────────

window.addEventListener('error', (event) => {
  // Não exibe erros de Three.js ao usuário, apenas loga no console
  console.error('Erro na aplicação:', event.message);
});

// ── DICA DE PERFORMANCE ───────────────────────────────────────

// Pausa animações quando a aba não está visível (economiza CPU/GPU)
document.addEventListener('visibilitychange', () => {
  // As simulações usam requestAnimationFrame, que já pausa automaticamente
  // quando a aba não está ativa no Chrome/Firefox.
  // Mas podemos logar para debug:
  if (document.hidden) {
    console.debug('PhysicsLab3D: aba em segundo plano — animações pausadas pelo navegador');
  }
});
