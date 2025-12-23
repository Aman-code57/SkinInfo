import os
import pandas as pd
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications.efficientnet import preprocess_input
from sklearn.model_selection import train_test_split

# =========================
# CONFIG
# =========================
IMG_SIZE = 192
BATCH_SIZE = 16
WARMUP_EPOCHS = 2
FINE_TUNE_EPOCHS = 15

META_PATH = "data/HAM10000_metadata.csv"
IMAGE_DIR = "data/HAM10000_images"
SAVE_PATH = "skin_cancer_model_fast"

AUTOTUNE = tf.data.AUTOTUNE
print("GPU available:", tf.config.list_physical_devices("GPU"))

# =========================
# LOAD METADATA
# =========================
df = pd.read_csv(META_PATH)
df["image_path"] = df["image_id"].apply(
    lambda x: os.path.join(IMAGE_DIR, f"{x}.jpg")
)
df["label"] = df["dx"]

train_df, val_df = train_test_split(
    df,
    test_size=0.2,
    stratify=df["label"],
    random_state=42
)

# =========================
# LABEL LOOKUP
# =========================
class_names = sorted(train_df["label"].unique())
NUM_CLASSES = len(class_names)

label_lookup = layers.StringLookup(
    vocabulary=class_names,
    mask_token=None,
    num_oov_indices=0
)

def encode_label(label):
    return tf.one_hot(label_lookup(label), NUM_CLASSES)

# =========================
# DATA PIPELINE
# =========================
def load_image(path, label):
    img = tf.io.read_file(path)
    img = tf.image.decode_jpeg(img, channels=3)
    img = tf.image.resize(img, (IMG_SIZE, IMG_SIZE))
    img = preprocess_input(img)
    return img, encode_label(label)

train_ds = (
    tf.data.Dataset.from_tensor_slices(
        (train_df["image_path"].values, train_df["label"].values)
    )
    .shuffle(2000)
    .map(load_image, num_parallel_calls=AUTOTUNE)
    .batch(BATCH_SIZE)
    .prefetch(AUTOTUNE)
)

val_ds = (
    tf.data.Dataset.from_tensor_slices(
        (val_df["image_path"].values, val_df["label"].values)
    )
    .map(load_image, num_parallel_calls=AUTOTUNE)
    .batch(BATCH_SIZE)
    .prefetch(AUTOTUNE)
)

# =========================
# FOCAL LOSS (TRAINING ONLY)
# =========================
def focal_loss(gamma=2.0, alpha=0.25):
    def loss(y_true, y_pred):
        y_pred = tf.clip_by_value(y_pred, 1e-7, 1 - 1e-7)
        ce = -y_true * tf.math.log(y_pred)
        weight = alpha * tf.pow(1 - y_pred, gamma)
        return tf.reduce_sum(weight * ce, axis=1)
    return loss

# =========================
# MODEL
# =========================
base_model = tf.keras.applications.EfficientNetB0(
    include_top=False,
    input_shape=(IMG_SIZE, IMG_SIZE, 3),
    weights="imagenet"
)

base_model.trainable = False

model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.BatchNormalization(),
    layers.Dropout(0.4),
    layers.Dense(NUM_CLASSES, activation="softmax", dtype="float32")
])

# =========================
# WARMUP TRAINING
# =========================
model.compile(
    optimizer=tf.keras.optimizers.Adam(1e-3),
    loss=focal_loss(),
    metrics=["accuracy"]
)

print("\n===== WARMUP TRAINING =====\n")
model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=WARMUP_EPOCHS
)

# =========================
# FINE TUNING
# =========================
base_model.trainable = True
for layer in base_model.layers[:-20]:
    layer.trainable = False

model.compile(
    optimizer=tf.keras.optimizers.Adam(3e-5),
    loss=focal_loss(),
    metrics=["accuracy"]
)

callbacks = [
    tf.keras.callbacks.EarlyStopping(
        monitor="val_loss",
        patience=4,
        restore_best_weights=True,
        verbose=1
    ),
    tf.keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.3,
        patience=2,
        min_lr=1e-6,
        verbose=1
    )
]

print("\n===== FINE TUNING =====\n")
model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=FINE_TUNE_EPOCHS,
    callbacks=callbacks
)

# =========================
# ✅ FINAL SAVE (ERROR-PROOF)
# =========================
# IMPORTANT: compile=False avoids serializing custom loss
model.save(SAVE_PATH, compile=False)

print(f"\nMODEL SAVED SUCCESSFULLY AT: {SAVE_PATH}")
