# ⚡ PhysicsLab3D – Laboratório Virtual de Eletrodinâmica

<div align="center">

![PhysicsLab3D](https://img.shields.io/badge/PhysicsLab3D-v2.0.0-blue?style=for-the-badge)
![Static Site](https://img.shields.io/badge/100%25-Est%C3%A1tico-success?style=for-the-badge)
![Three.js](https://img.shields.io/badge/Three.js-r128-green?style=for-the-badge)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Compat%C3%ADvel-222222?style=for-the-badge&logo=github)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**Laboratório virtual educacional para visualização interativa de fenômenos elétricos em 3D**

[Demonstração](#) · [Reportar Bug](issues) · [Sugerir Funcionalidade](issues)

</div>

---

## 📖 Sobre o Projeto

**PhysicsLab3D** é um laboratório virtual educacional desenvolvido com o objetivo de tornar conceitos de Eletrodinâmica mais acessíveis e compreensíveis. Através de simulações interativas em 3D, o projeto permite que estudantes e professores visualizem fenômenos elétricos que muitas vezes são difíceis de observar ou reproduzir em sala de aula.

A proposta central é **aproximar teoria e prática** através da programação e visualização científica, transformando equações e conceitos abstratos em experiências visuais interativas.

> 🧭 **Esta versão (2.0.0)** é **100% estática** — todo o cálculo físico que antes rodava em um backend Java agora roda diretamente no navegador, em JavaScript puro. Isso significa que o projeto pode ser aberto direto do arquivo `index.html`, sem instalar nada, e publicado gratuitamente no **GitHub Pages**. A aparência, as fórmulas e a experiência de uso permanecem exatamente as mesmas da versão anterior.

---

## 💡 Motivação

> *"Sou um estudante apaixonado por Física e tecnologia. Este projeto surgiu da vontade de transformar conceitos abstratos em experiências visuais interativas. Muitas demonstrações não podem ser facilmente realizadas em sala de aula, então a proposta é utilizar programação e visualização 3D para aproximar teoria e prática. A Física não precisa ser apenas equações no quadro — ela pode ser explorada, sentida e visualizada."*

A ideia nasceu da frustração de estudar fenômenos elétricos apenas através de fórmulas, sem uma forma visual de compreender o que realmente acontece. O campo elétrico ao redor de uma carga, o fluxo de elétrons em um circuito, a interação entre cargas — tudo isso ganha vida em 3D aqui.

---

## ✨ Funcionalidades

### ⚡ Módulos Disponíveis

| Módulo | Descrição | Visualização 3D |
|--------|-----------|-----------------|
| **Lei de Ohm** | Simulação interativa de V = R × I | Circuito animado com fluxo de corrente |
| **Associação de Resistores** | Série e paralelo com resistência equivalente | Diagrama de circuito dinâmico |
| **Circuitos Elétricos** | Fonte, resistores e lâmpadas | Fluxo de corrente com brilho proporcional |
| **Campo Elétrico 3D** | Visualização de linhas de campo e vetores | Renderização Three.js com cargas interativas |
| **Interação Entre Cargas** | Atração e repulsão de cargas | Animação de forças vetoriais |

### 🎓 Modo Sala de Aula

Ative o **Modo Sala de Aula** para:
- Explicações detalhadas de cada variável
- Linguagem simplificada e didática
- Aplicações do mundo real para cada conceito
- Perfeito para uso em apresentações e aulas

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript Vanilla (ES6+)
- **Motor de física:** JavaScript puro (`js/modules/physics.js`) — sem servidor
- **Visualização 3D:** Three.js (via CDN, `r128`)
- **Hospedagem:** Qualquer servidor de arquivos estáticos — GitHub Pages, Netlify, Vercel, ou até o sistema de arquivos local
- **Sem frameworks, sem backend:** Sem React, Angular, Spring Boot, Node.js ou qualquer linguagem de servidor — apenas código limpo e direto

---

## 🔄 Migração do Backend Java para JavaScript Puro

Este projeto começou com um pequeno backend em Java (`com.sun.net.httpserver.HttpServer`) que tinha **duas responsabilidades**:

1. **Servir os arquivos estáticos** do frontend (`StaticFileHandler`).
2. **Calcular fórmulas físicas** sob demanda, através de endpoints HTTP (`/api/ohm`, `/api/resistors/series`, `/api/resistors/parallel`, `/api/electric-field`, `/api/charge-force`).

Nenhuma dessas responsabilidades pode existir no GitHub Pages, porque o GitHub Pages **não executa código no servidor** — ele apenas entrega arquivos estáticos (HTML, CSS, JS, imagens) por CDN. Não há JVM, não há processo Java rodando, não há porta `8080` para responder requisições.

A tabela abaixo resume exatamente o que foi feito com cada parte do backend:

| Classe / Endpoint Java | Função original | Por que não funciona no GitHub Pages | Onde está agora |
|---|---|---|---|
| `Main.java` / `StaticFileHandler.java` | Servia `index.html`, `css/`, `js/` via HTTP | GitHub Pages já faz isso nativamente — não é preciso nenhum código equivalente | *(não é mais necessário — o próprio GitHub Pages serve os arquivos)* |
| `BaseHandler.java` | Utilitários de parsing de query string e resposta JSON | Específico do `com.sun.net.httpserver`, que não existe no navegador | *(não é mais necessário)* |
| `OhmHandler.java` + `OhmLaw.java` | `GET /api/ohm` — calcula V, R, I ou P (Lei de Ohm) | Exigia uma requisição de rede a um processo Java que não existe em produção estática | `js/modules/physics.js` → `Physics.calcOhm()` / `Physics.ohm.*` |
| `ResistorsSeriesHandler.java` + `ResistorCircuit.java` | `GET /api/resistors/series` — resistência equivalente em série | Idem acima | `js/modules/physics.js` → `Physics.calcSeries()` |
| `ResistorsParallelHandler.java` + `ResistorCircuit.java` | `GET /api/resistors/parallel` — resistência equivalente em paralelo | Idem acima | `js/modules/physics.js` → `Physics.calcParallel()` |
| `ElectricFieldHandler.java` + `ElectricField.java` | `GET /api/electric-field` — intensidade, potencial e energia do campo | Idem acima (este endpoint já não era consumido por nenhuma simulação do frontend) | `js/modules/physics.js` → `Physics.calcElectricField()` |
| `ChargeForceHandler.java` + `ElectricField.java` | `GET /api/charge-force` — força de Coulomb entre duas cargas | Idem acima | `js/modules/physics.js` → `Physics.calcChargeForce()` |
| `models/Charge.java`, `models/Resistor.java` | Modelos de domínio usados apenas internamente no backend | Não eram serializados nem expostos por nenhum endpoint | A simulação de Campo Elétrico já representava cargas como objetos JS (`{ id, value, x, y, z }`) independentemente do backend |

**Observação importante:** boa parte dessa migração já existia *parcialmente* no próprio frontend original — cada módulo de simulação já tinha um bloco `catch` com uma fórmula local equivalente, usado como contingência caso o backend estivesse fora do ar. Esta versão **promove esse cálculo local a único caminho de execução**, elimina as chamadas de rede (`fetch`) que nunca teriam sucesso em um ambiente estático, e centraliza todas as fórmulas em um único módulo (`physics.js`) para facilitar manutenção — exatamente como `api.js` centralizava as chamadas de rede antes.

Nenhuma fórmula, constante física (ex.: `k = 8.9875 × 10⁹ N·m²/C²`) ou validação (ex.: impedir resistência zero) foi alterada — apenas reescrita de Java para JavaScript.

---

## 📁 Estrutura do Projeto

```
PhysicsLab3D/
├── index.html                  # Página principal (abra este arquivo para rodar localmente)
├── css/
│   └── style.css               # Estilos globais (idêntico à versão anterior)
├── js/
│   ├── main.js                 # Inicialização e navegação entre módulos
│   ├── modules/
│   │   ├── physics.js          # Motor de física local (substitui o backend Java + api.js)
│   │   ├── ui.js                # Componentes de interface (sliders, toasts etc.)
│   │   └── classroomMode.js    # Modo Sala de Aula
│   └── simulations/
│       ├── ohmLaw.js            # Simulação Lei de Ohm
│       ├── resistors.js         # Simulação de resistores (série/paralelo)
│       ├── circuits.js          # Simulação de circuitos com lâmpada
│       ├── electricField.js     # Simulação de campo elétrico 3D
│       └── chargeInteraction.js # Interação entre cargas (Lei de Coulomb)
├── assets/                     # Reservado para ícones/recursos futuros (vazio hoje)
├── images/                     # Reservado para screenshots da documentação (vazio hoje)
├── README.md
├── LICENSE
├── .gitignore
├── CONTRIBUTING.md
└── CHANGELOG.md
```

> A pasta `frontend/` e o diretório `src/main/java/...` (backend Java) da versão 1.0 não existem mais nesta estrutura — veja a seção [Migração do Backend](#-migração-do-backend-java-para-javascript-puro) para o motivo e o destino de cada arquivo.

---

## 🚀 Como Executar

### Opção 1 — Abrir diretamente (mais simples)

Como o projeto é 100% estático, basta abrir o arquivo `index.html` em qualquer navegador moderno (Chrome, Firefox, Edge, Safari) — **com duplo clique** ou arrastando o arquivo para a janela do navegador. Não é necessário instalar Java, Node.js ou qualquer outra ferramenta.

### Opção 2 — Servidor local (recomendado para desenvolvimento)

Alguns navegadores aplicam restrições de segurança a arquivos abertos via `file://`. Se notar qualquer comportamento estranho, sirva a pasta com um servidor estático simples:

```bash
# Com Python 3 (já vem instalado na maioria dos sistemas)
cd PhysicsLab3D
python3 -m http.server 8080
# Acesse http://localhost:8080

# Ou, com Node.js instalado
npx serve .
```

### Opção 3 — GitHub Pages (publicação online)

Veja a seção [Publicando no GitHub Pages](#-publicando-no-github-pages) abaixo.

---

## 🌐 Publicando no GitHub Pages

1. **Crie um repositório no GitHub** (ou use um existente) e envie todo o conteúdo desta pasta (`PhysicsLab3D/`) para a raiz do repositório:

   ```bash
   git init
   git add .
   git commit -m "PhysicsLab3D — versão estática para GitHub Pages"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
   git push -u origin main
   ```

2. No GitHub, abra **Settings → Pages** do repositório.
3. Em **Build and deployment → Source**, selecione **Deploy from a branch**.
4. Em **Branch**, selecione `main` e a pasta `/ (root)` — já que `index.html` está na raiz do projeto.
5. Clique em **Save**. Em alguns minutos o GitHub publicará o site em:

   ```
   https://SEU-USUARIO.github.io/SEU-REPOSITORIO/
   ```

6. Pronto — nenhuma configuração adicional, build step, ou variável de ambiente é necessária, pois o projeto não tem dependências de backend.

> 💡 Se preferir manter o site em uma subpasta (por exemplo, `/docs`), basta mover todo o conteúdo deste projeto para essa pasta e selecionar `/docs` em vez de `/ (root)` no passo 4.

---

## 📸 Capturas de Tela

> *Em breve — simulações rodando*

| Campo Elétrico 3D | Lei de Ohm | Circuitos |
|:-----------------:|:----------:|:---------:|
| `[screenshot]` | `[screenshot]` | `[screenshot]` |

---

## 🗺️ Roadmap

### v2.0 (Atual) — Site estático
- [x] Lei de Ohm
- [x] Associação de Resistores
- [x] Circuitos Elétricos
- [x] Campo Elétrico 3D
- [x] Interação Entre Cargas
- [x] Modo Sala de Aula
- [x] Migração total do backend Java para JavaScript (compatível com GitHub Pages)

### v3.0 (Mecânica)
- [ ] MRU – Movimento Retilíneo Uniforme
- [ ] MRUV – Movimento Retilíneo Uniformemente Variado
- [ ] Queda Livre
- [ ] Lançamento Oblíquo

### v4.0 (Eletromagnetismo Avançado)
- [ ] Indução Eletromagnética
- [ ] Lei de Faraday
- [ ] Campo Magnético
- [ ] Ondas Eletromagnéticas

---

## 👨‍💻 Autor

**Desenvolvido com ❤️ por um estudante apaixonado por Física e tecnologia.**

Este projeto é parte de uma jornada de aprendizado que une programação, física e visualização científica. A ideia é simples: se um conceito é difícil de imaginar, vamos construir uma forma de vê-lo.

---

## 🤝 Contribuindo

Contribuições são muito bem-vindas! Veja [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes.

---

## 📄 Licença

Distribuído sob a licença MIT. Veja [LICENSE](LICENSE) para mais informações.

---

<div align="center">
  <sub>Feito com curiosidade científica e muitas linhas de código ⚡</sub>
</div>
