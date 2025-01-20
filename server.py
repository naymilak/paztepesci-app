import paho.mqtt.client as mqtt
import os
import time
import cv2
#for compress/decompress
from PIL import Image
import struct
import math
import numpy as np

host = "localhost"
port = 1883
client_id = "SEND_ANIMATION"
topic = "image"
recv_topic = "result"

#path where images are saved
path = r"C:\Users\denis\Documents\Šola\3.letnik\1.semester\Računalniška_Grafika\Projektno delo\projekt\paztepesci-app\images"

#when successfully connectes
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Server povezan s streznikom...")
        client.subscribe(recv_topic)
    else:
        print(f"Povezava ni uspela. Koda napake: {rc}")

#when receiving message
def on_message(client, userdata, msg):
    if msg.topic == recv_topic:
        print(f"Prejeto sporocilo: {msg.payload.decode()}")
        # adding code for saving this message
        # and showing it in js aplication as a result
        # of yolov5s model as a bonus
        # ...
        # ...
        # ...

# ------------------------------------- COMPRESS ----------------
def Encode(B, g, diff):
    bin = format(diff, f'0{g}b') #g-bitni zapis
    B.extend(int(bin, 2).to_bytes((g+7) // 8, 'big'))
    return B

def Napovej(slika, X, Y):
    epsilon = np.zeros(X*Y, dtype=int)
    slika = slika.astype(np.int16)
    for x in range(X):
        for y in range(Y):
            if x == 0 and y == 0:
                epsilon[x*Y+y] = slika[y, x]
            elif y == 0:
                epsilon[x*Y+y] = slika[y, x-1] - slika[y, x]
            elif x == 0:
                epsilon[x*Y+y] = slika[y-1, x] - slika[y, x]
            elif np.any(slika[y-1, x-1] >= max(slika[y, x-1], slika[y-1, x])):
                epsilon[x*Y+y] = min(slika[y, x-1], slika[y-1, x]) - slika[y, x]
            elif np.any(slika[y-1, x-1] <= min(slika[y, x-1], slika[y-1, x])):
                epsilon[x*Y+y] = max(slika[y, x-1], slika[y-1, x]) - slika[y, x]
            else:
                epsilon[x*Y+y] = slika[y, x-1] + slika[y-1, x] - slika[y-1, x-1] - slika[y, x]
    return epsilon

def IC(B, C, L, H):
    if H - L > 1:
        if C[H] != C[L]:
            m = math.floor(0.5 * (H + L))
            g = math.ceil(math.log2(C[H] - C[L] + 1))
            B = Encode(B, g, C[m] - C[L])
            if L < m:
                IC(B, C, L, m)
            if m < H:
                IC(B, C, m, H)
    return B
            
def kompresiraj(slika):
    if len(slika.shape) == 3:
        slika = cv2.cvtColor(slika, cv2.COLOR_BGR2GRAY)
    height = len(slika)
    width = len(slika[0])
    epsilon = Napovej(slika, width, height)
    n = width * height
    N = [0] * n
    N[0] = epsilon[0]
    for i in range(1, n):
        if epsilon[i] >= 0:
            N[i] = 2 * epsilon[i]
        else:
            N[i] = 2 * abs(epsilon[i]) - 1
    C = [0] * n
    C[0] = N[0]
    for i in range(1, n):
        C[i] = C[i-1] + N[i]

    # H - 16 bitov, B - 8 bitov, I - 32 bitov
    B = bytearray(struct.pack('>HBII', width, C[0], C[n-1], n))
    IC(B, C, 0, n-1)
    return B
# ------------------------------------ END OF COMPRESS ------------

def check_and_send(client, path):
    if os.path.exists(path) and os.path.isdir(path):
        files = os.listdir(path)
        if files:
            for file in files:
                if file.endswith((".jpg", ".jpeg", ".png")):
                    img_path = os.path.join(path, file)
                    try:
                        with open(img_path, "rb") as img:
                            img_data = img.read()
                            img_array = np.frombuffer(img_data, dtype=np.uint8)
                            decoded_img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
                            comp_img = kompresiraj(decoded_img)
                            client.publish(topic, comp_img)
                            print(f"Slika {file} poslana.")
                    except Exception as e:
                        print(f"Napaka pri posiljanju slike {file}: {e}")

#MQTT client 
client = mqtt.Client(client_id = client_id)
client.on_connect = on_connect
client.on_message = on_message

#connecting to server
print(f"Povezujem se na {host}:{port}...")
client.connect(host, port, 60)

#loop for receiving data
client.loop_start()

#checking for new files (images) to send
try:
    while True:
        check_and_send(client, path)
        time.sleep(10)
except KeyboardInterrupt:
    print("Program je koncan")
    client.loop_stop()
