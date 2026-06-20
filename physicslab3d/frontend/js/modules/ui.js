/**
 * ui.js — Utilitários de Interface
 *
 * Funções reutilizáveis para atualizar a interface do usuário.
 * Centralizadas aqui para evitar repetição nos módulos de simulação.
 */

const UI = {

  /**
   * Formata um número para exibição com no máximo `decimals` casas decimais.
   * Remove zeros desnecessários: 3.0000 → "3", 3.5000 → "3.5"
   */
  formatNumber(value, decimals = 2) {
    if (value === null || value === undefined || isNaN(value)) return '--';
    return parseFloat(value.toFixed(decimals)).toString();
  },

  /**
   * Formata valores muito grandes ou muito pequenos com notação científica.
   * Útil para valores de carga e campo elétrico.
   */
  formatScientific(value, decimals = 2) {
    if (value === null || value === undefined || isNaN(value)) return '--';
    if (Math.abs(value) < 0.001 || Math.abs(value) > 9999) {
      return value.toExponential(decimals);
    }
    return this.formatNumber(value, decimals);
  },

  /**
   * Sincroniza um slider com seu campo numérico e vice-versa.
   * Quando um muda, o outro é atualizado automaticamente.
   *
   * @param {string}   sliderId   ID do input[type="range"]
   * @param {string}   numberId   ID do input[type="number"]
   * @param {Function} onChange   Callback chamado com o novo valor
   */
  syncInputs(sliderId, numberId, onChange) {
    const slider = document.getElementById(sliderId);
    const number = document.getElementById(numberId);

    if (!slider || !number) return;

    slider.addEventListener('input', () => {
      number.value = slider.value;
      onChange(parseFloat(slider.value));
    });

    number.addEventListener('input', () => {
      const val = parseFloat(number.value);
      if (!isNaN(val)) {
        slider.value = val;
        onChange(val);
      }
    });
  },

  /**
   * Atualiza o texto de um elemento pelo seu ID.
   */
  setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  },

  /**
   * Mostra ou esconde um elemento pelo ID.
   */
  toggle(id, visible) {
    const el = document.getElementById(id);
    if (!el) return;
    if (visible) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  },

  /**
   * Adiciona ou remove uma classe CSS.
   */
  setClass(id, className, active) {
    const el = document.getElementById(id);
    if (!el) return;
    if (active) {
      el.classList.add(className);
    } else {
      el.classList.remove(className);
    }
  },

  /**
   * Retorna as dimensões corretas de um canvas considerando
   * o pixel ratio do dispositivo (para telas retina).
   */
  setupCanvasSize(canvas) {
    const rect  = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;

    canvas.width  = rect.width  * ratio;
    canvas.height = rect.height * ratio;

    return {
      width:  rect.width,
      height: rect.height,
      ratio
    };
  },

  /**
   * Exibe uma notificação temporária na tela.
   * Cria e remove automaticamente o elemento.
   */
  showToast(message, type = 'info') {
    const colors = {
      info:    '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      error:   '#ef4444'
    };

    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #1a2236;
      border: 1px solid ${colors[type] || colors.info};
      color: #e2e8f0;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 13px;
      font-family: 'Space Grotesk', sans-serif;
      z-index: 9999;
      animation: fadeIn 0.2s ease;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }
};
