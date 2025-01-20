import paho.mqtt.client as mqtt
import cv2
import numpy as np
import torch
import time
#for compress/decompress
from PIL import Image
import struct
import math

host = "localhost"
port = 1883
client_id = "RECEIVE_ANIMATION"
receive_topic = "image"
send_topic = "check"

model_path = r"C:\Users\denis\Documents\Šola\2.letnik\2.semester\Umetna inteligenca\Projektno_delo\celModel\crosswalk-traffic-light-detection-yolov5-master"
model = torch.hub.load(model_path, "custom", path=r"C:\Users\denis\Documents\Šola\2.letnik\2.semester\Umetna inteligenca\Projektno_delo\celModel\crosswalk-traffic-light-detection-yolov5-master\yolov5s.pt", source="local")
model.eval()

#function for detecting pedestrians...
def detected(img):
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = model(img_rgb)

    # check for any detections
    detections = results.xyxy[0].cpu().numpy() # [x-min y-min x-max y-max]

    #check if class is pedestrian
    for detection in detections:
        class_id = int(detection[5])
        if class_id == 0:
            return True
    return False

#when successfully connectes
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Client povezan s streznikom...")
        client.subscribe(receive_topic, qos=1)
    else:
        print(f"Povezava ni uspela. Koda napake: {rc}")

# ------------------------------------- DECOMPRESS -----------------
def Decode(B):
    odmik = 0
    width, c_0, cn_1, n = struct.unpack_from('>HBII', B, odmik)
    odmik += struct.calcsize('>HBII')

    C = [c_0] + [0] * (n-2) + [cn_1]

    def recursive_Decode(L, H):
        nonlocal odmik
        if H - L > 1:
            if C[H] == C[L]:
                for i in range(L+1, H):
                    C[i] = C[L]
            else:
                m = math.floor(0.5 * (H + L))
                g = math.ceil(math.log2(C[H] - C[L] + 1))
                st_bitov = (g + 7) // 8
                diff = int.from_bytes(B[odmik:odmik + st_bitov], 'big')
                odmik += st_bitov

                C[m] = C[L] + diff

                recursive_Decode(L, m)
                recursive_Decode(m, H)

    recursive_Decode(0, n-1)
    return width, n, C

def NapovejNazaj(epsilon, X, Y):
    slika = np.zeros((Y, X), dtype=int)
    for x in range(X):
        for y in range(Y):
            if x == 0 and y == 0:
                slika[y, x] = epsilon[x*Y+y]
            elif y == 0:
                slika[y, x] = slika[y, x-1] - epsilon[x*Y+y]
            elif x == 0:
                slika[y, x] = slika[y-1, x] - epsilon[x*Y+y]
            elif np.any(slika[y-1, x-1] >= max(slika[y, x-1], slika[y-1, x])):
                slika[y, x] = min(slika[y, x-1], slika[y-1, x]) - epsilon[x*Y+y]
            elif np.any(slika[y-1, x-1] <= min(slika[y, x-1], slika[y-1, x])):
                slika[y, x] = max(slika[y, x-1], slika[y-1, x]) - epsilon[x*Y+y]
            else:
                slika[y, x] = slika[y, x-1] + slika[y-1, x] - slika[y-1, x-1] - epsilon[x*Y+y]
    return slika

def dekompresiraj(B):
    width, n, C = Decode(B)  
    height = n // width
    N = [0] * n
    N[0] = C[0]
    for i in range(1, n):
        N[i] = C[i] - C[i-1]
    epsilon = [0] * n
    epsilon[0] = N[0]
    for i in range(1, n):
        if N[i] % 2 == 0:
            epsilon[i] = N[i] // 2
        else:
            epsilon[i] = -(N[i]+1) // 2
    P = NapovejNazaj(epsilon, width, height)
    if len(P.shape) == 2:
        P = cv2.cvtColor(P.astype(np.uint8), cv2.COLOR_GRAY2BGR) 
    return P
# ---------------------------------- END OF DECOMPRESS --------------

#when receiving message
def on_message(client, userdata, msg):
    print(f"Prejeto sporocilo na topic: {msg.topic}")
    try:
        img_data = msg.payload
        if len(img_data) == 0:
            print("slika je prazna...")
        
        decomp_img = dekompresiraj(img_data) # decompress img
        
        if decomp_img is not None:
            #cv2.imshow("Prejeta slika", decomp_img)     # to show img
            print("Prejeta slika...")
            #cv2.waitKey(1)                              # waiting for image to be rendered
            if detected(decomp_img):
                message = "PAZI PESEC!"
            else:
                message = "NI NEVARNOSTI..."

            if client.publish(send_topic, message):
                print(f"Poslano sporocilo: {message} na topic: {send_topic}")
            else:
                print("Napaka pri posiljanju sporocila...")
        else:
            print("Napaka: Slika je prazna.")
    except Exception as e:
        print(f"Napaka pri dekodiranju slike: {e}")

#MQTT client 
client = mqtt.Client(client_id = client_id, clean_session=True)
client.on_connect = on_connect
client.on_message = on_message

#connecting to server
print(f"Povezujem se na {host}:{port}...")
client.connect(host, port, 60)

#loop for receiving and sending data
try:
    print(f"Prijavljen na topic: {receive_topic} za prejem slik...")
    while True:
        client.loop()
        time.sleep(0.1)
except KeyboardInterrupt:
    print("Povezava prekinjena")
    client.disconnect()
    cv2.destroyAllWindows()