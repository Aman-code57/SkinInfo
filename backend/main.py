from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
import tensorflow as tf
from PIL import Image
import io

# -----------------------------------------------------
# LOAD MODEL (SavedModel format)
# -----------------------------------------------------
MODEL_PATH = "models/skin_model_fixed"
model = tf.saved_model.load(MODEL_PATH)
infer = model.signatures["serving_default"]

IMG_SIZE = 224

# -----------------------------------------------------
# CORRECT LABEL MAP (FROM YOUR TRAINING)
# VERY IMPORTANT — this fixes wrong predictions
# -----------------------------------------------------
label_map = {0: "akiec", 1: "bcc", 2: "bkl", 3: "df", 4: "mel", 5: "nv", 6: "vasc"}

# -----------------------------------------------------
# FASTAPI SETUP
# -----------------------------------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all (you can restrict later)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------------------------
# IMAGE PREPROCESSING
# -----------------------------------------------------
def preprocess(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((IMG_SIZE, IMG_SIZE))
    arr = np.array(img).astype("float32") / 255.0
    arr = np.expand_dims(arr, 0)
    return arr


# -----------------------------------------------------
# PREDICTION ENDPOINT
# -----------------------------------------------------
@app.post("/predict")
async def predict(image: UploadFile = File(...)):
    contents = await image.read()

    try:
        input_tensor = preprocess(contents)
    except:
        return JSONResponse({"error": "Invalid image"}, status_code=400)

    # Run model inference
    output = infer(tf.constant(input_tensor))
    preds = list(output.values())[0].numpy()[0]

    top_idx = int(np.argmax(preds))
    top_label = label_map[top_idx]
    top_conf = float(preds[top_idx])

    return {
        "label": top_label,
        "confidence": top_conf,
        "probs": {label_map[i]: float(preds[i]) for i in range(7)},
    }
