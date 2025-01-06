// Initialize Scene, Camera, and Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75, // Field of view
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1, // Near clipping plane
    1000 // Far clipping plane
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add a basic cube to the scene
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Position the cube and camera
cube.position.z = -3; // Move the cube slightly towards the camera so it is visible
camera.position.z = 5;

// Add basic lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft light that affects all objects
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1); // Point light that shines in all directions
pointLight.position.set(10, 10, 10); // Position the light
scene.add(pointLight);

// Basic Animation Loop
let animationRunning = false;
function animate() {
    if (!animationRunning) return;

    requestAnimationFrame(animate);

    // Rotate the cube for a simple animation
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene, camera);
}

// Add interaction: Move the cube with arrow keys
window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            cube.position.y += 0.1;
            break;
        case 'ArrowDown':
            cube.position.y -= 0.1;
            break;
        case 'ArrowLeft':
            cube.position.x -= 0.1;
            break;
        case 'ArrowRight':
            cube.position.x += 0.1;
            break;
    }
});

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Menu functionality (open new page for settings)
document.getElementById('menu').addEventListener('click', () => {
    window.open('settings.html', '_blank');
});

// "Start animation" button functionality
document.getElementById('start-animation').addEventListener('click', () => {
    animationRunning = true; // Start animation on button click
    animate(); // Begin animation loop
});
