// Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for the camera to move around the scene
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
// To allow for importing the .gltf file
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Create a Three.JS Scene
const scene = new THREE.Scene();
// Create a new camera with positions and angles
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Keep track of the mouse position, so we can make the eye move
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// OrbitControls allow the camera to move around the scene
let controls;

// List of models to load
const modelsToRender = ['kabina', 'dino', 'model3'];  // Add more model names here

// Instantiate a loader for the .gltf file
const loader = new GLTFLoader();

// Load each model in the list
modelsToRender.forEach((model) => {
  loader.load(
    `./models/${model}/scene.gltf`, // Path to the model file
    function (gltf) {
      // If the file is loaded, add it to the scene
      const object = gltf.scene;
      object.position.set(Math.random() * 10 - 5, 0, Math.random() * 10 - 5); // Random positioning for demonstration
      scene.add(object);
    },
    function (xhr) {
      // While it is loading, log the progress
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
      // If there is an error, log it
      console.error(error);
    }
  );
});

// Instantiate a new renderer and set its size
const renderer = new THREE.WebGLRenderer({ alpha: true }); // Alpha: true allows for transparent background
renderer.setSize(window.innerWidth, window.innerHeight);

// Set the background color to white
renderer.setClearColor(0xffffff, 1); // 0xffffff is the hex code for white

// Add the renderer to the DOM
document.getElementById("container3D").appendChild(renderer.domElement);

// Set the camera position
camera.position.z = 25;

// Add lights to the scene, so we can actually see the 3D models
const topLight = new THREE.DirectionalLight(0xffffff, 1); // (color, intensity)
topLight.position.set(500, 500, 500); // Top-left-ish
topLight.castShadow = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, 1);
scene.add(ambientLight);

// This adds controls to the camera, so we can rotate / zoom it with the mouse
controls = new OrbitControls(camera, renderer.domElement);

// Render the scene
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// Add a listener to the window, so we can resize the window and the camera
window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Add mouse position listener, so we can make the eye move (if you have such a model)
document.onmousemove = (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
}

// Start the 3D rendering
animate();
