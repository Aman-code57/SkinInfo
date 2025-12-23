import tensorflow as tf
from keras.layers import TFSMLayer
from keras.models import Model
import keras

# Load the existing SavedModel using TFSMLayer
tfsm_layer = TFSMLayer(
    "backend/models/skin_model_saved", call_endpoint="serving_default"
)

# Create a Keras model wrapping the TFSMLayer
inputs = tf.keras.Input(shape=(224, 224, 3))  # Adjust shape as needed
outputs = tfsm_layer(inputs)
model = Model(inputs=inputs, outputs=outputs)

# Resave it as Keras model with proper metadata
model.save("backend/models/skin_model.h5")

print("Model resaved as Keras .h5 file.")
