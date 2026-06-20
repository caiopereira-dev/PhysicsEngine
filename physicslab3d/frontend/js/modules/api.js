/**
 * api.js — Comunicação com o Backend Java
 *
 * Este módulo centraliza todas as chamadas para os endpoints da API.
 * Isso facilita a manutenção: se a URL mudar, só precisa alterar aqui.
 */

const API = {
  // URL base do backend (mesmo servidor que serve os arquivos)
  BASE_URL: '',

  /**
   * Função auxiliar para fazer requisições GET à API.
   * Retorna os dados já convertidos de JSON para objeto JavaScript.
   */
  async get(endpoint, params = {}) {
    // Monta a query string a partir do objeto de parâmetros
    const query = new URLSearchParams(params).toString();
    const url   = `${this.BASE_URL}${endpoint}${query ? '?' + query : ''}`;

    try {
      const response = await fetch(url);
      const data     = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro na requisição');
      }

      return data;
    } catch (err) {
      console.error(`Erro na API [${endpoint}]:`, err);
      throw err;
    }
  },

  // ── Endpoints específicos ─────────────────────────────────

  /**
   * Calcula o terceiro parâmetro da Lei de Ohm.
   * Deve fornecer exatamente dois dos três: voltage, resistance, current
   */
  calcOhm(params) {
    return this.get('/api/ohm', params);
  },

  /**
   * Calcula resistência equivalente em série.
   * @param {number[]} values  Array com os valores dos resistores em Ohms
   * @param {number}   voltage Tensão da fonte
   */
  calcSeries(values, voltage) {
    return this.get('/api/resistors/series', {
      values: values.join(','),
      voltage
    });
  },

  /**
   * Calcula resistência equivalente em paralelo.
   */
  calcParallel(values, voltage) {
    return this.get('/api/resistors/parallel', {
      values: values.join(','),
      voltage
    });
  },

  /**
   * Calcula intensidade do campo elétrico.
   * @param {number} charge   Carga em Coulombs (ex: 1e-9 para 1 nC)
   * @param {number} distance Distância em metros
   */
  calcElectricField(charge, distance) {
    return this.get('/api/electric-field', { charge, distance });
  },

  /**
   * Calcula força entre duas cargas (Lei de Coulomb).
   */
  calcChargeForce(q1, q2, distance) {
    return this.get('/api/charge-force', { q1, q2, distance });
  }
};
