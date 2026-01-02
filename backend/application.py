import os
import sys
import json
import numpy
import tensorflow as tf
import PIL
from PIL import Image
from datetime import datetime
from io import BytesIO

from flask import Flask, request, jsonify
from flask_cors import CORS

from numpy import expand_dims
from mrcnn.config import Config
from mrcnn.model import MaskRCNN, mold_image

# ===================== ENV =====================
ENV = os.environ.get("ENV", "local")

# ===================== PATHS =====================
ROOT_DIR = os.path.abspath("./")
sys.path.append(ROOT_DIR)

WEIGHTS_FOLDER = "./weights"
MODEL_NAME = "mask_rcnn_hq"
WEIGHTS_FILE_NAME = "maskrcnn_15_epochs.h5"

# ===================== FLASK =====================
application = Flask(__name__)
CORS(application, resources={r"/*": {"origins": [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://2dto3dfloorplan.netlify.app"
]}})

# ===================== GLOBALS =====================
_model = None
_graph = None
cfg = None

# ===================== CONFIG =====================
class PredictionConfig(Config):
    NAME = "floorPlan_cfg"
    NUM_CLASSES = 1 + 3  # background + wall + window + door
    GPU_COUNT = 1
    IMAGES_PER_GPU = 1

# ===================== LOAD MODEL =====================
@application.before_first_request
def load_model():
    global _model, _graph, cfg

    os.makedirs(WEIGHTS_FOLDER, exist_ok=True)
    weights_path = os.path.join(WEIGHTS_FOLDER, WEIGHTS_FILE_NAME)

    if not os.path.exists(weights_path):
        print("Downloading weights...")
        import gdown
        url = "https://drive.google.com/uc?id=1uPlVjiI3OZpwS6cUtkC_Z5cSk96rZMwW"
        gdown.download(url, weights_path, quiet=False)

    cfg = PredictionConfig()
    model_dir = os.path.join(ROOT_DIR, "mrcnn")

    print("Loading Mask R-CNN model...")
    _model = MaskRCNN(mode="inference", model_dir=model_dir, config=cfg)
    _model.load_weights(weights_path, by_name=True)

    _graph = tf.get_default_graph()
    print("Model loaded successfully")

# ===================== HELPERS =====================
def myImageLoader(imageInput):
    image = numpy.asarray(imageInput)
    h, w, c = image.shape
    return image, w, h

def getClassNames(classIds):
    result = []
    for classid in classIds:
        if classid == 1:
            result.append({"name": "wall"})
        elif classid == 2:
            result.append({"name": "window"})
        elif classid == 3:
            result.append({"name": "door"})
    return result

def normalizePoints(bbx, classIds):
    result = []
    doorCount = 0
    doorDifference = 0

    for i, bb in enumerate(bbx):
        if classIds[i] == 3:
            doorCount += 1
            doorDifference += max(abs(bb[3] - bb[1]), abs(bb[2] - bb[0]))

        result.append([bb[0], bb[1], bb[2], bb[3]])

    avgDoor = doorDifference / doorCount if doorCount else 0
    return result, avgDoor

def turnSubArraysToJson(objectsArr):
    result = []
    for obj in objectsArr:
        result.append({
            "x1": obj[1],
            "y1": obj[0],
            "x2": obj[3],
            "y2": obj[2]
        })
    return result

# ===================== ROUTES =====================
@application.route("/", methods=["GET"])
def health():
    return {
        "status": "ok",
        "env": ENV
    }

@application.route("/", methods=["POST"])
def prediction():
    global _model, _graph, cfg

    imagefile = Image.open(request.files["image"].stream).convert("RGB")
    image, w, h = myImageLoader(imagefile)

    scaled_image = mold_image(image, cfg)
    sample = expand_dims(scaled_image, 0)

    with _graph.as_default():
        r = _model.detect(sample, verbose=0)[0]

    bbx = r["rois"].tolist()
    points, averageDoor = normalizePoints(bbx, r["class_ids"])

    return jsonify({
        "points": turnSubArraysToJson(points),
        "classes": getClassNames(r["class_ids"]),
        "Width": w,
        "Height": h,
        "averageDoor": averageDoor
    })
