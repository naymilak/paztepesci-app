/*const client = mqtt.connect('ws://localhost:1883');

client.on('connect', () => {
    console.log("Povezan na MQTT strežnik...");
});*/
// Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for the camera to move around the scene
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

import { camera, scene } from "./main.js";
const virtualRenderer = new THREE.WebGLRenderer({ alpha: true});
virtualRenderer.setSize(window.innerWidth, window.innerHeight);
    
function captrueVirtualScreenshot(offset){
    const virtualCamera = camera.clone();
    virtualCamera.position.copy(camera.position);
    virtualCamera.rotation.copy(camera.rotation);
    virtualCamera.position.add(new THREE.Vector3(offset, 0, 0));
    
    virtualRenderer.render(scene, virtualCamera);
    
    const screenshot = virtualRenderer.domElement.toDataURL('image.png');
    const imageWindow = window.open();
    if(imageWindow)
        imageWindow.document.write('<img src="' + screenshot + '" />');
    else
        console.log("napaka");
    displayScreenshot(screenshot);
    return screenshot;
}
function sendFrame(img){
    const topic = "animation/img";
    client.publish(topic, img, {qos:1}, (err) => {
        if(err)
            console.error("Napaka pri pošiljanju slike: ", err);
        else
            console.log("Slika poslana na strežnik...");
    })
}
function displayScreenshot(base64Image) {
    const imgElement = document.createElement('img'); // Ustvari img element
    imgElement.src = base64Image; // Nastavi src atribut na base64 sliko
    imgElement.style.maxWidth = "100%"; // Po želji omeji širino slike
    imgElement.style.maxHeight = "100%"; // Po želji omeji višino slike
    imgElement.style.margin = "10px"; // Po želji dodaš rob okoli slike

    // Doda sliko na telo dokumenta
    document.body.appendChild(imgElement);
    console.log("slika dodana...");
}
setInterval(() => {
    const img = captrueVirtualScreenshot(20);
    //sendFrame(img);
}, 1000);