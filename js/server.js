var mqtt;
var host = "164.8.160.173";
var port = 9001;

function onConnect(){
    console.log("Povezan s strežnikom...");
    let message = new Paho.MQTT.Message("tukaj sem...");
    message.destinationName = "animation";
    mqtt.send(message);
}
function MQTTconnect(){
    console.log("Povezujem se na " + host + ":" + port);
    mqtt = new Paho.MQTT.Client(host, port, "client-kamera");
    var options = {
        timeout: 3,
        onSuccess: onConnect,
        onFailure: function (error){
            console.error("Povezava ni uspela...");
            console.error("Koda napake: " + error.errorCode);
            console.error(error.errorMessage);
        }
    };
    mqtt.connect(options);
}
//MQTTconnect();
// Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";

//import from main.js
import { getCamera, getScene, getCarObject } from "./main.js";
const virtualRenderer = new THREE.WebGLRenderer({ alpha: true});
virtualRenderer.setSize(window.innerWidth, window.innerHeight);

//function to take the picture of current position of camera
function captrueVirtualScreenshot(offsetX, offsetY){
    const camera = getCamera();
    const virtualCamera = camera.clone(); //copy original camera
    virtualCamera.position.copy(getCarObject().position); //get position of moving object
    virtualCamera.rotation.copy(getCarObject().rotation); //get rotation of moving object
    virtualCamera.position.add(new THREE.Vector3(offsetX, offsetY, 0)); //do an offset on virtual camera

    const scene = getScene();
    virtualRenderer.render(scene, virtualCamera);
    
    const screenshot = virtualRenderer.domElement.toDataURL('image.png'); //create a screenshot of canvas based on your position
    /*const imageWindow = window.open(); 
    if(imageWindow)
        imageWindow.document.write('<img src="' + screenshot + '" />');
    else
        console.log("napaka");*/
    displayScreenshot(screenshot);
    return screenshot;
}
//function for sending the taken picture to MQTT server
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
    const imgElement = document.createElement('img'); 
    imgElement.src = base64Image; 
    imgElement.style.maxWidth = "100%";
    imgElement.style.maxHeight = "100%"; 
    imgElement.style.margin = "10px";

    document.body.appendChild(imgElement);
    console.log("slika dodana...");
}
//function to transform the taken screenshot to right format to send to MQTT server
function toBuffer(img){
    const base64Data = img.split(',')[1];
    return Buffer.from(base64Data, 'base64');
}
//interval for how often the function for screenshot is called
setInterval(() => {
    const img = captrueVirtualScreenshot(-20, 5);
    //data = toBuffer(img);
    //sendFrame(img);
}, 1000);