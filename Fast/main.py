import base64
import io
import os
from contextlib import asynccontextmanager

import torch
import torch.nn as nn
import torch.nn.functional as F
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pydantic import BaseModel
from torchvision import transforms

load_dotenv()

CLASS_NAMES = ["Kertas", "Batu", "Gunting"]
MODEL_PATH = os.getenv("MODEL_PATH", "model/best_model.pth")
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model: nn.Module | None = None

transform = transforms.Compose(
    [
        transforms.Resize((300, 300)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225],
        ),
    ]
)


def _make_conv_block(in_channels: int, out_channels: int) -> nn.Sequential:
    return nn.Sequential(
        nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1),
        nn.BatchNorm2d(out_channels),
        nn.ReLU(inplace=True),
        nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1),
        nn.BatchNorm2d(out_channels),
        nn.ReLU(inplace=True),
        nn.MaxPool2d(kernel_size=2, stride=2),
    )


class RockPaperScissorsCNN(nn.Module):
    def __init__(self, num_blocks: int = 2, dropout: float = 0.5) -> None:
        super().__init__()
        self.block1 = _make_conv_block(3, 32)
        self.block2 = _make_conv_block(32, 64)
        self.block3 = _make_conv_block(64, 128) if num_blocks == 3 else None

        fc_in = 2048 if num_blocks == 3 else 1024
        self.adaptive_pool = nn.AdaptiveAvgPool2d((4, 4))
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(fc_in, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(dropout),
            nn.Linear(256, 128),
            nn.ReLU(inplace=True),
            nn.Dropout(dropout),
            nn.Linear(128, 3),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.block1(x)
        x = self.block2(x)
        if self.block3 is not None:
            x = self.block3(x)
        x = self.adaptive_pool(x)
        return self.classifier(x)


def _infer_num_blocks(state_dict: dict) -> int:
    return 3 if any(key.startswith("block3.") for key in state_dict) else 2


def load_model_weights(path: str) -> RockPaperScissorsCNN:
    if not os.path.exists(path):
        raise FileNotFoundError(f"Model weights not found at: {path}")

    checkpoint = torch.load(path, map_location=device, weights_only=False)

    if isinstance(checkpoint, nn.Module):
        checkpoint = checkpoint.state_dict()
    elif isinstance(checkpoint, dict) and "state_dict" in checkpoint:
        checkpoint = checkpoint["state_dict"]

    if not isinstance(checkpoint, dict):
        raise ValueError("Unsupported checkpoint format. Expected state_dict.")

    num_blocks = _infer_num_blocks(checkpoint)
    cnn = RockPaperScissorsCNN(num_blocks=num_blocks)
    cnn.load_state_dict(checkpoint)
    cnn.to(device)
    cnn.eval()
    return cnn


def predict_image(image: Image.Image) -> dict[str, float | str]:
    if model is None:
        raise RuntimeError("Model is not initialized.")

    rgb_image = image.convert("RGB")
    tensor = transform(rgb_image).unsqueeze(0).to(device)

    with torch.no_grad():
        logits = model(tensor)
        probabilities = F.softmax(logits, dim=1)
        confidence_score, predicted_index = torch.max(probabilities, dim=1)

    index = predicted_index.item()
    return {
        "label": CLASS_NAMES[index],
        "confidence_score": round(confidence_score.item(), 4),
    }


def decode_base64_image(image_base64: str) -> Image.Image:
    if "," in image_base64:
        image_base64 = image_base64.split(",", 1)[1]

    try:
        image_bytes = base64.b64decode(image_base64, validate=True)
        return Image.open(io.BytesIO(image_bytes))
    except Exception as exc:
        raise ValueError(f"Invalid base64 image payload: {exc}") from exc


class WebcamPredictRequest(BaseModel):
    image_base64: str


@asynccontextmanager
async def lifespan(_: FastAPI):
    global model
    model = load_model_weights(MODEL_PATH)
    yield


app = FastAPI(
    title="Rock Paper Scissors API",
    description="CNN inference API for Batu, Gunting, Kertas classification",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS if CORS_ORIGINS != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok", "model": os.path.basename(MODEL_PATH)}


@app.post("/predict/webcam")
async def predict_webcam(payload: WebcamPredictRequest) -> dict[str, float | str]:
    try:
        image = decode_base64_image(payload.image_base64)
        return predict_image(image)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to process webcam image: {exc}",
        ) from exc


@app.post("/predict/file")
async def predict_file(file: UploadFile = File(...)) -> dict[str, float | str]:
    try:
        contents = await file.read()
        if not contents:
            raise ValueError("Uploaded file is empty.")

        image = Image.open(io.BytesIO(contents))
        return predict_image(image)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to process uploaded file: {exc}",
        ) from exc


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host=HOST, port=PORT, reload=False)
