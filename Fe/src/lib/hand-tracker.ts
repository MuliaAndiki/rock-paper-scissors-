import {
  FilesetResolver,
  HandLandmarker,
  type HandLandmarkerResult,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";

const WASM_CDN =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

let handLandmarker: HandLandmarker | null = null;

export async function initHandTracker(): Promise<HandLandmarker> {
  if (handLandmarker) {
    return handLandmarker;
  }

  const vision = await FilesetResolver.forVisionTasks(WASM_CDN);
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: MODEL_URL,
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 1,
    minHandDetectionConfidence: 0.6,
    minHandPresenceConfidence: 0.6,
    minTrackingConfidence: 0.6,
  });

  return handLandmarker;
}

export function detectHands(
  landmarker: HandLandmarker,
  video: HTMLVideoElement,
  timestampMs: number,
): HandLandmarkerResult {
  return landmarker.detectForVideo(video, timestampMs);
}

export type HandLandmarks = NormalizedLandmark[];

const HAND_CONNECTIONS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [5, 9],
  [9, 13],
  [13, 17],
];

export function drawHandOverlay(
  canvas: HTMLCanvasElement,
  landmarks: HandLandmarks,
  mirrored: boolean,
) {
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  const { width, height } = canvas;
  context.clearRect(0, 0, width, height);

  const toX = (x: number) => (mirrored ? (1 - x) * width : x * width);
  const toY = (y: number) => y * height;

  context.lineWidth = 3;
  context.strokeStyle = "rgba(52, 211, 153, 0.9)";
  context.fillStyle = "rgba(16, 185, 129, 0.95)";

  for (const [start, end] of HAND_CONNECTIONS) {
    const from = landmarks[start];
    const to = landmarks[end];
    context.beginPath();
    context.moveTo(toX(from.x), toY(from.y));
    context.lineTo(toX(to.x), toY(to.y));
    context.stroke();
  }

  for (const landmark of landmarks) {
    context.beginPath();
    context.arc(toX(landmark.x), toY(landmark.y), 5, 0, Math.PI * 2);
    context.fill();
  }
}

export function clearHandOverlay(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
}

export function getHandBoundingBox(
  landmarks: HandLandmarks,
  frameWidth: number,
  frameHeight: number,
  paddingRatio = 0.3,
) {
  const xs = landmarks.map((landmark) => landmark.x * frameWidth);
  const ys = landmarks.map((landmark) => landmark.y * frameHeight);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const boxWidth = maxX - minX;
  const boxHeight = maxY - minY;
  const side = Math.max(boxWidth, boxHeight) * (1 + paddingRatio * 2);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  const x = Math.max(0, centerX - side / 2);
  const y = Math.max(0, centerY - side / 2);
  const width = Math.min(frameWidth - x, side);
  const height = Math.min(frameHeight - y, side);

  return { x, y, width, height };
}

export function cropHandToBase64(
  video: HTMLVideoElement,
  landmarks: HandLandmarks,
  outputSize = 300,
): string | null {
  const frameWidth = video.videoWidth;
  const frameHeight = video.videoHeight;

  if (!frameWidth || !frameHeight) {
    return null;
  }

  const bbox = getHandBoundingBox(landmarks, frameWidth, frameHeight);
  if (bbox.width < 40 || bbox.height < 40) {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;

  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }

  context.fillStyle = "#111827";
  context.fillRect(0, 0, outputSize, outputSize);
  context.drawImage(
    video,
    bbox.x,
    bbox.y,
    bbox.width,
    bbox.height,
    0,
    0,
    outputSize,
    outputSize,
  );

  const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
  return dataUrl.split(",")[1] ?? null;
}
