// Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for the camera to move around the scene
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
// To allow for importing the .gltf file
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Create a Three.JS Scene
const scene = new THREE.Scene();

// Create a new camera with positions and angles
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);

// Variables for car movement
let isCarMoving = false; // To track if the car is moving
let carObject = null; // Reference for the car (kabina)
let carSpeed = 30; // Default speed
const defaultCarSpeed = 30; // Default speed for reset

// Store the initial positions for reset
const initialCarPosition = { x: 80, y: 3, z: 500 };
const initialCameraPosition = { x: -50, y: 25, z: 60 };

// List of models to load
const modelConfigs = [
  {
    name: "cesta",
    position: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 }
  },
  {
    name: "kabina",
    position: initialCarPosition,
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: 0, z: 0 }
  },
  {
    name: "kolesar",
    position: { x: 100, y: 11, z: 200 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: Math.PI, z: 0 }
  },
  {
    name: "pesec",
    position: { x: -80, y: 5, z: -500 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: Math.PI, z: 0 }
  }
];

// Instantiate a loader for the .gltf file
const loader = new GLTFLoader();

modelConfigs.forEach((config) => {
  loader.load(
    `./models/${config.name}/scene.gltf`,
    function (gltf) {
      const object = gltf.scene;
      object.position.set(config.position.x, config.position.y, config.position.z);
      object.scale.set(config.scale.x, config.scale.y, config.scale.z);
      object.rotation.set(config.rotation.x, config.rotation.y, config.rotation.z);

      if (config.name === "kabina") {
        carObject = object;

        carObject.add(camera);
        camera.position.set(initialCameraPosition.x, initialCameraPosition.y, initialCameraPosition.z);
        camera.lookAt(0, 2, 0);
      }

      scene.add(object);
    },
    function (xhr) {
      console.log(`${config.name} ${(xhr.loaded / xhr.total * 100).toFixed(2)}% loaded`);
    },
    function (error) {
      console.error(`Error loading ${config.name}:`, error);
    }
  );
});

// Instantiate a new renderer and set its size
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Set the background color to white
renderer.setClearColor(0xffffff, 1);

// Add the renderer to the DOM
document.getElementById("container3D").appendChild(renderer.domElement);

// Add lights to the scene
const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(500, 500, 500);
topLight.castShadow = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, 1);
scene.add(ambientLight);

// Add camera controls
const controls = new OrbitControls(camera, renderer.domElement);

// Event listeners for buttons
document.getElementById("startStopButton").addEventListener("click", () => {
  isCarMoving = !isCarMoving;
  document.getElementById("startStopButton").textContent = isCarMoving ? "Stop" : "Start";
});

document.getElementById("resetButton").addEventListener("click", () => {
  if (carObject) {
    carObject.position.set(initialCarPosition.x, initialCarPosition.y, initialCarPosition.z);
    camera.position.set(initialCameraPosition.x, initialCameraPosition.y, initialCameraPosition.z);
    camera.lookAt(0, 2, 0);
    carSpeed = defaultCarSpeed;
    document.getElementById("carSpeed").value = defaultCarSpeed;
  }
});

const speedScalingFactor = 100 / 30;

document.getElementById("applyButton").addEventListener("click", () => {
  const inputSpeed = parseFloat(document.getElementById("carSpeed").value);
  if (!isNaN(inputSpeed) && inputSpeed > 0) {
    carSpeed = inputSpeed * speedScalingFactor;
  } else {
    alert("Please enter a valid positive number for speed.");
    document.getElementById("carSpeed").value = carSpeed / speedScalingFactor;
  }
});

// Render the scene
function animate() {
  requestAnimationFrame(animate);

  if (carObject && isCarMoving) {
    carObject.position.z -= carSpeed * 0.01;
  }

  renderer.render(scene, camera);
}

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start rendering
animate();
