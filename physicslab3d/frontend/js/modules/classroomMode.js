/**
 * classroomMode.js — Modo Sala de Aula
 *
 * Controla a exibição das explicações pedagógicas em cada módulo.
 * Quando ativado, mostra caixas de informação com linguagem
 * simplificada e exemplos do mundo real.
 */

const ClassroomMode = {
  active: false,

  // IDs dos elementos de informação em cada módulo
  infoElements: [
    'ohm-classroom',
    'resistors-classroom',
    'circuits-classroom',
    'field-classroom',
    'charges-classroom'
  ],

  /**
   * Inicializa o modo sala de aula, conectando os botões.
   */
  init() {
    const toggleBtn  = document.getElementById('classroomToggle');
    const banner     = document.getElementById('classroomBanner');
    const closeBaner = document.getElementById('closeBanner');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggle());
    }

    if (closeBaner) {
      closeBaner.addEventListener('click', () => {
        this.deactivate();
      });
    }
  },

  /**
   * Alterna o modo sala de aula.
   */
  toggle() {
    if (this.active) {
      this.deactivate();
    } else {
      this.activate();
    }
  },

  /**
   * Ativa o modo sala de aula.
   * Mostra todas as caixas de explicação e o banner.
   */
  activate() {
    this.active = true;

    // Destaca o botão
    const btn = document.getElementById('classroomToggle');
    if (btn) btn.classList.add('active');

    // Mostra o banner
    const banner = document.getElementById('classroomBanner');
    if (banner) banner.classList.remove('hidden');

    // Mostra todas as caixas de informação
    this.infoElements.forEach(id => {
      UI.toggle(id, true);
    });

    UI.showToast('🎓 Modo Sala de Aula ativado!', 'warning');
  },

  /**
   * Desativa o modo sala de aula.
   */
  deactivate() {
    this.active = false;

    // Remove destaque do botão
    const btn = document.getElementById('classroomToggle');
    if (btn) btn.classList.remove('active');

    // Esconde o banner
    const banner = document.getElementById('classroomBanner');
    if (banner) banner.classList.add('hidden');

    // Esconde todas as caixas de informação
    this.infoElements.forEach(id => {
      UI.toggle(id, false);
    });
  },

  /**
   * Verifica se o modo está ativo.
   */
  isActive() {
    return this.active;
  }
};
