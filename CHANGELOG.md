# Changelog

Todas as mudanças notáveis deste projeto serão documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [2.0.0] - 2026-06-21

### Alterado (Breaking Change de infraestrutura — sem mudança visual ou funcional para o usuário)
- **Migração completa para site estático**, compatível com GitHub Pages e
  qualquer outro hospedeiro de arquivos estáticos.
- Todas as fórmulas físicas (Lei de Ohm, associação de resistores em
  série/paralelo e Lei de Coulomb) que antes viviam no backend Java agora
  são calculadas inteiramente no navegador, no novo módulo
  `js/modules/physics.js`.
- A estrutura de pastas foi simplificada: o conteúdo de `frontend/` foi
  promovido para a raiz do projeto (`index.html`, `css/`, `js/`), e foram
  adicionadas as pastas `assets/` e `images/` para uso futuro.

### Removido
- Backend Java (`src/main/java/com/physicslab3d/server` e
  `.../physics`/`.../models`) — não é mais necessário, pois GitHub Pages
  não executa código Java/JVM. Toda a lógica equivalente foi portada para
  `js/modules/physics.js` (ver README, seção "Migração do backend").
- `js/modules/api.js` — substituído pelo módulo local `physics.js`; não há
  mais nenhuma chamada de rede (`fetch`) para cálculos físicos.
- `run.sh` e `run.bat` — scripts que compilavam e iniciavam o servidor
  Java; sem backend, não há mais nada para compilar ou iniciar.

### Corrigido
- Eliminadas tentativas de requisição HTTP que sempre falhariam em um
  ambiente 100% estático (o que antes gerava erros silenciosos no console
  do navegador, capturados pelo bloco `catch` de cada simulação).

---

## [1.0.0] - 2024-01-01

### Adicionado
- Módulo Lei de Ohm com simulação de circuito animado
- Módulo Associação de Resistores (série e paralelo)
- Módulo Circuitos Elétricos com lâmpadas e fluxo visual
- Módulo Campo Elétrico 3D com Three.js
- Módulo Interação Entre Cargas com vetores de força
- Modo Sala de Aula para uso educacional
- Servidor HTTP em Java puro
- Interface tema escuro inspirada em laboratórios científicos
- Cálculos físicos no backend Java
- Layout responsivo

---

## [Não lançado]

### Planejado
- MRU e MRUV (Mecânica)
- Queda Livre e Lançamento Oblíquo
- Indução Eletromagnética
- Campo Magnético
