import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

export type GestureLabel = "Batu" | "Gunting" | "Kertas";

type FingerState = {
  thumb: boolean;
  index: boolean;
  middle: boolean;
  ring: boolean;
  pinky: boolean;
};

function distance(
  a: NormalizedLandmark,
  b: NormalizedLandmark,
  width: number,
  height: number,
) {
  const dx = (a.x - b.x) * width;
  const dy = (a.y - b.y) * height;
  return Math.hypot(dx, dy);
}

function isFingerExtended(
  landmarks: NormalizedLandmark[],
  tip: number,
  pip: number,
  mcp: number,
  wrist: NormalizedLandmark,
  width: number,
  height: number,
) {
  const tipPoint = landmarks[tip];
  const pipPoint = landmarks[pip];
  const mcpPoint = landmarks[mcp];
  const tipToWrist = distance(tipPoint, wrist, width, height);
  const pipToWrist = distance(pipPoint, wrist, width, height);
  const tipToMcp = distance(tipPoint, mcpPoint, width, height);
  const pipToMcp = distance(pipPoint, mcpPoint, width, height);

  return tipToWrist > pipToWrist * 1.05 && tipToMcp > pipToMcp * 1.15;
}

function isThumbExtended(
  landmarks: NormalizedLandmark[],
  width: number,
  height: number,
) {
  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  const indexMcp = landmarks[5];

  const tipToIp = distance(thumbTip, thumbIp, width, height);
  const ipToMcp = distance(thumbIp, indexMcp, width, height);

  return (
    distance(thumbTip, wrist, width, height) >
      distance(thumbIp, wrist, width, height) * 1.02 && tipToIp > ipToMcp * 0.65
  );
}

export function getFingerStates(
  landmarks: NormalizedLandmark[],
  frameWidth: number,
  frameHeight: number,
): FingerState {
  const wrist = landmarks[0];

  return {
    thumb: isThumbExtended(landmarks, frameWidth, frameHeight),
    index: isFingerExtended(landmarks, 8, 6, 5, wrist, frameWidth, frameHeight),
    middle: isFingerExtended(
      landmarks,
      12,
      10,
      9,
      wrist,
      frameWidth,
      frameHeight,
    ),
    ring: isFingerExtended(landmarks, 16, 14, 13, wrist, frameWidth, frameHeight),
    pinky: isFingerExtended(
      landmarks,
      20,
      18,
      17,
      wrist,
      frameWidth,
      frameHeight,
    ),
  };
}

export function classifyGestureFromLandmarks(
  landmarks: NormalizedLandmark[],
  frameWidth: number,
  frameHeight: number,
): { label: GestureLabel | null; confidence: number; fingers: FingerState } {
  const fingers = getFingerStates(landmarks, frameWidth, frameHeight);
  const extendedCount = [
    fingers.index,
    fingers.middle,
    fingers.ring,
    fingers.pinky,
  ].filter(Boolean).length;

  if (extendedCount === 0) {
    return { label: "Batu", confidence: 0.92, fingers };
  }

  if (extendedCount >= 4) {
    return { label: "Kertas", confidence: 0.9, fingers };
  }

  if (fingers.index && fingers.middle && !fingers.ring && !fingers.pinky) {
    return { label: "Gunting", confidence: 0.88, fingers };
  }

  if (extendedCount === 1 && fingers.index) {
    return { label: "Gunting", confidence: 0.55, fingers };
  }

  return { label: null, confidence: 0, fingers };
}

export function mergePredictions(
  gesture: { label: GestureLabel | null; confidence: number },
  cnn: { label: string; confidence_score: number } | null,
): { label: string; confidence: number; source: "gesture" | "cnn" | "merged" } {
  if (!gesture.label && cnn) {
    return {
      label: cnn.label,
      confidence: cnn.confidence_score,
      source: "cnn",
    };
  }

  if (gesture.label && !cnn) {
    return {
      label: gesture.label,
      confidence: gesture.confidence,
      source: "gesture",
    };
  }

  if (gesture.label && cnn) {
    if (gesture.label === cnn.label) {
      return {
        label: gesture.label,
        confidence: Math.min(
          0.99,
          gesture.confidence * 0.45 + cnn.confidence_score * 0.55 + 0.1,
        ),
        source: "merged",
      };
    }

    if (gesture.confidence >= 0.8) {
      return {
        label: gesture.label,
        confidence: gesture.confidence,
        source: "gesture",
      };
    }

    if (cnn.confidence_score >= 0.7) {
      return {
        label: cnn.label,
        confidence: cnn.confidence_score,
        source: "cnn",
      };
    }

    return {
      label: gesture.label,
      confidence: gesture.confidence,
      source: "gesture",
    };
  }

  return { label: "", confidence: 0, source: "gesture" };
}
