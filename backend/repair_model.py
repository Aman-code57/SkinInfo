import h5py, json
import tensorflow as tf

old_path = "backend/models/skin_model.h5"
new_path = "backend/models/skin_model_fixed.keras"

# Load original H5 file
with h5py.File(old_path, "r") as f:
    if "model_config" in f.attrs:
        config_raw = f.attrs["model_config"]
    else:
        raise RuntimeError("model_config not found in H5 file!")

    # Handle both bytes and str
    if isinstance(config_raw, bytes):
        config_json = config_raw.decode("utf-8")
    else:
        config_json = config_raw  # already a string

config = json.loads(config_json)


# Remove batch_shape from InputLayer
def fix(node):
    if isinstance(node, dict):
        if node.get("class_name") == "InputLayer":
            node["config"].pop("batch_shape", None)
        for v in node.values():
            fix(v)
    elif isinstance(node, list):
        for item in node:
            fix(item)


fix(config)

# Rebuild model structure
new_config_json = json.dumps(config)
model = tf.keras.models.model_from_json(new_config_json)

# Load weights
model.load_weights(old_path)

# Save fixed model
model.save(new_path)

print("Model repaired successfully and saved as:", new_path)
