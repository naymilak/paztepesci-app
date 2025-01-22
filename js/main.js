// Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for importing the .gltf file
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Store the start time for the website load
const pageLoadStartTime = performance.now();

// Create a Three.JS Scene
const scene = new THREE.Scene();

// Create a new camera with positions and angles
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);

// Keep track of the mouse position, so we can make the eye move
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// Variables for car movement
let isCarMoving = false; // To track if the car is moving
let carObject = null; // Reference for the car (kabina)
let carSpeed = 30; // Default speed

let pedestrianObject = null;
let cyclistObject = null;
const pedestrianSpeed = 5;
const cyclistSpeed = 8;

// Store the initial positions for reset
const initialCarPosition = { x: 70, y: 3, z: 1100 };
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
    name: "kolesar1",
    position: { x: -80, y: 8.5, z: 200 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: Math.PI, z: 0 }
  },
  {
    name: "kolesar2",
    position: { x: 60, y: 8.5, z: -1600 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: Math.PI * 2, z: 0 }
  },
  {
    name: "pesec1",
    position: { x: -70, y: 4.5, z: -1340 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 }
  },
  {
    name: "pesec2",
    position: { x: 75, y: 4.5, z: -600 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: Math.PI * 2, z: 0 }
  },
  {
    name: "pesec3",
    position: { x: -70, y: 4.5, z: -500 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: Math.PI, z: 0 }
  },
  {
    name: "pesec4",
    position: { x: -30, y: 4.5, z: -1800 },
    scale: { x: 1, y: 1, z: 1 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 }
  }
];

// Instantiate a loader for the .gltf file
const loader = new GLTFLoader();

// Track the start time for each model load
modelConfigs.forEach((config) => {
  const modelLoadStartTime = performance.now(); // Start time for each model

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
      } else if (config.name === "pesec4") {
        if (!pedestrianObject) {
          pedestrianObject = [];
        }
        pedestrianObject.push(object);
      } else if (config.name === "kolesar" || config.name === "kolesar2") {
        if (!cyclistObject) {
          cyclistObject = [];
        }
        cyclistObject.push(object);
      }

      scene.add(object);

      const modelLoadEndTime = performance.now();
      const modelLoadTime = (modelLoadEndTime - modelLoadStartTime).toFixed(2);
      console.log(`${config.name} loaded in ${modelLoadTime}ms`);
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

// Event listeners for buttons
document.getElementById("startStopButton").addEventListener("click", () => {
  isCarMoving = !isCarMoving;
  document.getElementById("startStopButton").textContent = isCarMoving ? "Stop" : "Start";
});

document.getElementById("resetButton").addEventListener("click", () => {
  if (carObject) {
    carObject.position.set(initialCarPosition.x, initialCarPosition.y, initialCarPosition.z);
    camera.position.set(initialCameraPosition.x, initialCameraPosition.y, initialCameraPosition.z);

    isCarMoving = false;
    document.getElementById("startStopButton").textContent = "Start";
    document.getElementById("carSpeed").value = carSpeed;
  }
});

document.getElementById("applyButton").addEventListener("click", () => {
  const inputSpeed = parseFloat(document.getElementById("carSpeed").value);
  if (!isNaN(inputSpeed) && inputSpeed > 0) {
    carSpeed = inputSpeed;
  } else {
    alert("Please enter a valid positive number for speed.");
    document.getElementById("carSpeed").value = carSpeed;
  }
});

// Render the scene
function animate() {
  requestAnimationFrame(animate);

  if (carObject && isCarMoving) {
    carObject.position.z -= carSpeed * 0.05;

    // Log the car's current position in real-time
    console.log(`Car position: x=${carObject.position.x.toFixed(2)}, y=${carObject.position.y.toFixed(2)}, z=${carObject.position.z.toFixed(2)}`);
  }

  if (pedestrianObject && isCarMoving) {
    pedestrianObject.forEach(pedestrian => {
      pedestrian.position.z -= pedestrianSpeed * 0.05;
    });
  }
  
  if (cyclistObject && isCarMoving) {
    cyclistObject.forEach(cyclist => {
      cyclist.position.z -= cyclistSpeed * 0.05;
    });
  }  

  renderer.render(scene, camera);
}

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener("keydown", function (event) {
  if (event.code === "Space") {
    // Prevent the default behavior of the Space bar (scrolling, etc.)
    event.preventDefault();

    // Toggle the movement state
    isCarMoving = !isCarMoving;

    // Update the button text
    document.getElementById("startStopButton").textContent = isCarMoving ? "Stop" : "Start";
  }
});

// Calculate total page load time after all assets are loaded
window.addEventListener("load", () => {
  const pageLoadEndTime = performance.now();
  const totalPageLoadTime = (pageLoadEndTime - pageLoadStartTime).toFixed(2);
  console.log(`Page loaded in ${totalPageLoadTime}ms`);
});

// Start rendering
animate();

export function getCamera() {
  return camera;
}
export function getScene() {
  return scene;
}
export function getCarObject() {
  return carObject;
}
