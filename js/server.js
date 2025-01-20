var mqtt;
var host = "164.8.160.173";
var port = 9001;

let folderHandle = null; // Variable to store the folder handle
let screenshotIntervalId = null; // Variable to store the interval ID

function onConnect() {
    console.log("Povezan s strežnikom...");
    let message = new Paho.MQTT.Message("tukaj sem...");
    message.destinationName = "animation";
    mqtt.send(message);
}

function MQTTconnect() {
    console.log("Povezujem se na " + host + ":" + port);
    mqtt = new Paho.MQTT.Client(host, port, "client-kamera");
    var options = {
        timeout: 3,
        onSuccess: onConnect,
        onFailure: function (error) {
            console.error("Povezava ni uspela...");
            console.error("Koda napake: " + error.errorCode);
            console.error(error.errorMessage);
        }
    };
    mqtt.connect(options);
}

// Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

// Import from main.js
import { getCamera, getScene, getCarObject } from "./main.js";

const virtualRenderer = new THREE.WebGLRenderer({ alpha: true });
virtualRenderer.setSize(window.innerWidth, window.innerHeight);

// Modified to only call after user interaction
async function selectFolder() {
    try {
        folderHandle = await window.showDirectoryPicker();
        console.log("Folder selected for saving screenshots.");
    } catch (err) {
        console.error("Error selecting folder:", err);
    }
}

// Function to take the picture of the current position of the camera
async function captureVirtualScreenshot(offsetX, offsetY) {
    console.log("Attempting to capture screenshot...");
    if (!folderHandle) {
        console.error("Folder not selected. Please select a folder first.");
        return;
    }

    const camera = getCamera();
    const virtualCamera = camera.clone(); // Copy original camera
    virtualCamera.position.copy(getCarObject().position); // Get position of moving object
    virtualCamera.rotation.copy(getCarObject().rotation); // Get rotation of moving object
    virtualCamera.position.add(new THREE.Vector3(offsetX, offsetY, 0)); // Do an offset on virtual camera

    const scene = getScene();
    virtualRenderer.render(scene, virtualCamera);

    const screenshot = virtualRenderer.domElement.toDataURL("image/png"); // Create a screenshot of canvas
    displayScreenshot(screenshot);
    saveScreenshot(screenshot); // Save the screenshot
}

// Function to save the screenshot to the selected folder
async function saveScreenshot(base64Image) {
    try {
        const base64Data = base64Image.split(",")[1]; // Strip out the base64 header
        const buffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
        const fileName = `screenshot_${Date.now()}.png`;

        // Ensure file system access is only called after user interaction
        if (!folderHandle) {
            console.error("No folder selected. User interaction is required.");
            return;
        }

        const fileHandle = await folderHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(buffer);
        await writable.close();

        console.log(`Screenshot saved as ${fileName}`);
    } catch (err) {
        console.error("Error saving screenshot:", err);
    }
}

// Function to display the screenshot
function displayScreenshot(base64Image) {
    const imgElement = document.createElement("img");
    imgElement.src = base64Image;
    imgElement.style.maxWidth = "100%";
    imgElement.style.maxHeight = "100%";
    imgElement.style.margin = "10px";

    document.body.appendChild(imgElement);
    console.log("Slika dodana...");
}

// Function to start capturing screenshots at intervals
function startScreenshotCapture() {
    if (screenshotIntervalId) {
        console.warn("Screenshot capture is already running.");
        return;
    }

    console.log("Starting screenshot capture every second...");
    screenshotIntervalId = setInterval(() => {
        console.log("Capturing screenshot...");
        captureVirtualScreenshot(-20, 5); // Capture screenshot with offsets
    }, 1000); // Capture a screenshot every second
}

// Button to trigger folder selection
const button = document.createElement("button");
button.textContent = "Select Folder for Screenshots";
button.style.position = "absolute";
button.style.top = "50px";
button.style.left = "50%";
button.style.transform = "translateX(-50%)";
button.style.margin = "20px";
button.style.backgroundColor = "white";
button.style.color = "black";
button.style.border = "1px solid black";
button.style.padding = "10px 20px";

// On button click, allow folder selection and start capturing screenshots
button.onclick = async (event) => {
    event.preventDefault(); // Prevent default behavior of the button

    console.log("Button clicked, starting folder selection...");
    await selectFolder(); // Only select folder after user clicks

    // Start taking screenshots after folder selection
    if (folderHandle) {
        console.log("Folder selected, starting screenshot capture...");
        startScreenshotCapture();
    } else {
        console.error("No folder selected. Screenshot capture not started.");
    }
};
document.body.appendChild(button);

// Add a button for manual screenshot capture (optional)
const captureButton = document.createElement("button");
captureButton.textContent = "Capture Screenshot Now";
captureButton.style.position = "absolute";
captureButton.style.top = "100px";
captureButton.style.left = "50%";
captureButton.style.transform = "translateX(-50%)";
captureButton.style.margin = "20px";
captureButton.style.backgroundColor = "white";
captureButton.style.color = "black";
captureButton.style.border = "1px solid black";
captureButton.style.padding = "10px 20px";

// On button click, capture a screenshot manually
captureButton.onclick = () => {
    console.log("Manual screenshot capture triggered.");
    captureVirtualScreenshot(-20, 5); // Manual capture with offsets
};
document.body.appendChild(captureButton);
