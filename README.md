# 3D Interactive Visualization - "Pazte Pešci"

## Overview
This project is a **3D interactive visualization system** designed to simulate real-world driving scenarios with enhanced detection and alert mechanisms for pedestrians and cyclists. It features customizable settings and real-time alerts in a visually immersive 3D environment.

## Features
- **Pedestrian and Cyclist Detection**:
  - Real-time detection of pedestrians and cyclists in the simulation.
  - Triggers visual and auditory alerts:
    - **3D Model Alerts**: A phone or speaker model displays warnings.
    - **Sound Alerts**: Different sounds based on the type of danger (e.g., pedestrian crossing).
- **Adjustable Danger Threshold**:
  - Users can customize the detection boundaries to suit their preferences.
- **3D Scene Animation**:
  - Simulated car movement through a realistic 3D environment featuring:
    - Roads, sidewalks, pedestrian crossings.
    - Dynamic animations for vehicles, pedestrians, and cyclists.

## Technologies Used
- **Visualization**:
  - [Three.js](https://threejs.org/) for 3D rendering.
  - WebGL for browser-based 3D graphics.
- **Communication**:
  - MQTT for image and message transmission.
  - USB for microcontroller integration.
- **Alert System**:
  - Speaker integration for sound alerts.
  - Display integration for visual alerts.

## System Components
1. **Camera**:
   - Mounted inside the vehicle, capturing real-time video.
2. **Microcontroller**:
   - Processes video data using a trained detection model.
3. **Computer**:
   - Displays the 3D simulation and manages system alerts.
