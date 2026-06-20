![PhysicsLab3D](https://img.shields.io/badge/PhysicsLab3D-v1.0.0-blue?style=for-the-badge)
![Java](https://img.shields.io/badge/Java-17+-orange?style=for-the-badge&logo=java)
![Three.js](https://img.shields.io/badge/Three.js-r128-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**Laboratório virtual educacional para visualização interativa de fenômenos elétricos em 3D**

[Demonstração](#) · [Reportar Bug](issues) · [Sugerir Funcionalidade](issues)

</div>

---

# PhysicsLab3D – Virtual Electrodynamics Laboratory

A virtual laboratory for visualizing electrodynamics concepts in three dimensions.

---

## Overview

**PhysicsLab3D** is an educational virtual laboratory built to make electrodynamics concepts more accessible and easier to understand. Through interactive 3D simulations, the project allows students and educators to visualize electrical phenomena that are often difficult to observe or reproduce in a traditional classroom.

The core idea is to **bridge theory and practice** through programming and scientific visualization, turning abstract equations and concepts into interactive visual experiences.

---

## Motivation

Electrical phenomena are difficult to understand through formulas alone, with no visual reference for what is actually happening. The electric field around a charge, the flow of electrons through a circuit, the interaction between charges — all of this is brought to life here, in three dimensions.

The project favors a small, transparent codebase over a feature-heavy framework stack. Every calculation that drives the visualizations is implemented explicitly in Java and can be read end to end.

---

## Features

### Available Modules

| Module | Description | 3D Visualization |
|--------|-------------|-------------------|
| **Ohm's Law** | Interactive simulation of V = R × I | Animated circuit with current flow |
| **Resistor Networks** | Series and parallel with equivalent resistance | Dynamic circuit diagram |
| **Electrical Circuits** | Source, resistors, and lamps | Current flow with proportional brightness |
| **Electric Field 3D** | Visualization of field lines and vectors | Three.js rendering with interactive charges |
| **Charge Interaction** | Attraction and repulsion between charges | Vector force animation |

### Classroom Mode

Enable **Classroom Mode** for:
- Detailed explanations of each variable
- Simplified, plain-language descriptions
- Real-world applications for each concept
- A format suited for lectures and presentations

---

## Technology Stack

- **Backend:** Java (dependency-free HTTP server)
- **Frontend:** HTML5, CSS3, vanilla JavaScript
- **3D Rendering:** Three.js
- **No frameworks:** No React, Angular, or Spring Boot — a small, direct codebase

---

## Project Structure

```
physicslab3d/
├── src/
│   └── main/
│       └── java/
│           └── com/physicslab3d/
│               ├── server/
│               │   ├── HttpServer.java        # HTTP server entry point
│               │   └── RequestHandler.java    # Request routing
│               ├── physics/
│               │   ├── OhmLaw.java            # Ohm's Law calculations
│               │   ├── ResistorCircuit.java   # Series/parallel resistor logic
│               │   └── ElectricField.java     # Electric field calculations
│               └── models/
│                   ├── Resistor.java          # Resistor model
│                   └── Charge.java            # Electric charge model
├── frontend/
│   ├── index.html                # Main page
│   ├── css/
│   │   └── style.css             # Global styles
│   └── js/
│       ├── main.js               # Initialization and navigation
│       ├── modules/
│       │   ├── api.js            # Backend communication layer
│       │   ├── ui.js             # Shared UI components
│       │   └── classroomMode.js  # Classroom Mode logic
│       └── simulations/
│           ├── ohmLaw.js         # Ohm's Law simulation
│           ├── resistors.js      # Resistor network simulation
│           ├── circuits.js       # Circuit simulation
│           ├── electricField.js  # 3D electric field simulation
│           └── chargeInteraction.js # Charge interaction simulation
├── README.md
├── LICENSE
├── .gitignore
├── CONTRIBUTING.md
└── CHANGELOG.md
```

---

## Getting Started

### Requirements

- JDK 17 or later
- A modern browser (Chrome, Firefox, Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/physicslab3d.git

# Move into the project directory
cd physicslab3d

# Compile the project
javac -d out src/main/java/com/physicslab3d/**/*.java

# Run the server
java -cp out com.physicslab3d.server.HttpServer
```

### Access

Open your browser at: **http://localhost:8080**

---

## Roadmap

### v1.0 (Current)
- [x] Ohm's Law
- [x] Resistor Networks
- [x] Electrical Circuits
- [x] Electric Field 3D
- [x] Charge Interaction
- [x] Classroom Mode

### v2.0 (Kinematics)
- [ ] Uniform Motion
- [ ] Uniformly Accelerated Motion
- [ ] Free Fall
- [ ] Projectile Motion

### v3.0 (Advanced Electromagnetism)
- [ ] Electromagnetic Induction
- [ ] Faraday's Law
- [ ] Magnetic Field
- [ ] Electromagnetic Waves

---

## Author

**Developed by Caio Pereira.**

This project is part of a learning path connecting programming, physics, and scientific visualization. The premise is simple: if a concept is hard to imagine, build a way to see it.

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.


<div align="center">
  <sub>Feito com curiosidade científica e muitas linhas de código ⚡</sub>
</div>
