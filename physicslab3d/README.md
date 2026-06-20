# ⚡ PhysicsLab3D – Laboratório Virtual de Eletrodinâmica

<div align="center">

![PhysicsLab3D](https://img.shields.io/badge/PhysicsLab3D-v1.0.0-blue?style=for-the-badge)
![Java](https://img.shields.io/badge/Java-17+-orange?style=for-the-badge&logo=java)
![Three.js](https://img.shields.io/badge/Three.js-r128-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**Laboratório virtual educacional para visualização interativa de fenômenos elétricos em 3D**

[Demonstração](#) · [Reportar Bug](issues) · [Sugerir Funcionalidade](issues)

</div>

---

## 📖 Sobre o Projeto

**PhysicsLab3D** é um laboratório virtual educacional desenvolvido com o objetivo de tornar conceitos de Eletrodinâmica mais acessíveis e compreensíveis. Através de simulações interativas em 3D, o projeto permite que estudantes e professores visualizem fenômenos elétricos que muitas vezes são difíceis de observar ou reproduzir em sala de aula.

A proposta central é **aproximar teoria e prática** através da programação e visualização científica, transformando equações e conceitos abstratos em experiências visuais interativas.

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

- **Backend:** Java (servidor HTTP simples)
- **Frontend:** HTML5, CSS3, JavaScript Vanilla
- **Visualização 3D:** Three.js
- **Sem frameworks:** Sem React, Angular, Spring Boot — apenas código limpo e direto

---

## 📁 Estrutura do Projeto

```
physicslab3d/
├── src/
│   └── main/
│       └── java/
│           └── com/physicslab3d/
│               ├── server/
│               │   ├── HttpServer.java        # Servidor HTTP simples
│               │   └── RequestHandler.java    # Roteamento de requisições
│               ├── physics/
│               │   ├── OhmLaw.java            # Cálculos da Lei de Ohm
│               │   ├── ResistorCircuit.java   # Associação de resistores
│               │   └── ElectricField.java     # Cálculos de campo elétrico
│               └── models/
│                   ├── Resistor.java          # Modelo de resistor
│                   └── Charge.java            # Modelo de carga elétrica
├── frontend/
│   ├── index.html                # Página principal
│   ├── css/
│   │   └── style.css             # Estilos globais
│   └── js/
│       ├── main.js               # Inicialização e navegação
│       ├── modules/
│       │   ├── api.js            # Comunicação com o backend
│       │   ├── ui.js             # Componentes de interface
│       │   └── classroomMode.js  # Modo Sala de Aula
│       └── simulations/
│           ├── ohmLaw.js         # Simulação Lei de Ohm
│           ├── resistors.js      # Simulação de resistores
│           ├── circuits.js       # Simulação de circuitos
│           ├── electricField.js  # Simulação de campo elétrico 3D
│           └── chargeInteraction.js # Interação entre cargas
├── README.md
├── LICENSE
├── .gitignore
├── CONTRIBUTING.md
└── CHANGELOG.md
```

---

## 🚀 Como Executar

### Pré-requisitos

- Java 17 ou superior
- Navegador moderno (Chrome, Firefox, Edge)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/physicslab3d.git

# Entre no diretório
cd physicslab3d

# Compile o projeto
javac -d out src/main/java/com/physicslab3d/**/*.java

# Execute o servidor
java -cp out com.physicslab3d.server.HttpServer
```

### Acesso

Abra o navegador em: **http://localhost:8080**

---

## 📸 Capturas de Tela

> *Em breve — simulações rodando*

| Campo Elétrico 3D | Lei de Ohm | Circuitos |
|:-----------------:|:----------:|:---------:|
| `[screenshot]` | `[screenshot]` | `[screenshot]` |

---

## 🗺️ Roadmap

### v1.0 (Atual)
- [x] Lei de Ohm
- [x] Associação de Resistores
- [x] Circuitos Elétricos
- [x] Campo Elétrico 3D
- [x] Interação Entre Cargas
- [x] Modo Sala de Aula

### v2.0 (Mecânica)
- [ ] MRU – Movimento Retilíneo Uniforme
- [ ] MRUV – Movimento Retilíneo Uniformemente Variado
- [ ] Queda Livre
- [ ] Lançamento Oblíquo

### v3.0 (Eletromagnetismo Avançado)
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
