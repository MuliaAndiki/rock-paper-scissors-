"use client";

import type { HandLandmarker } from "@mediapipe/tasks-vision";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { predictWebcam } from "@/lib/api";
import {
  classifyGestureFromLandmarks,
  mergePredictions,
  type GestureLabel,
} from "@/lib/gesture-classifier";
import {
  clearHandOverlay,
  cropHandToBase64,
  detectHands,
  drawHandOverlay,
  initHandTracker,
} from "@/lib/hand-tracker";
import { RockPaperScissorsGameSection } from "@/section/rock-paper-scissors-game-section";

const POSE_OPTIONS = ["Batu", "Gunting", "Kertas", "Gambar Acak"] as const;
const VALID_POSES = ["Batu", "Gunting", "Kertas"] as const;

type PoseOption = (typeof POSE_OPTIONS)[number];

function getRandomTargetPose(): PoseOption {
  return POSE_OPTIONS[Math.floor(Math.random() * POSE_OPTIONS.length)];
}

function checkMatch(targetPose: PoseOption, prediction: string) {
  if (targetPose === "Gambar Acak") {
    return VALID_POSES.includes(prediction as (typeof VALID_POSES)[number]);
  }

  return prediction === targetPose;
}

export function RockPaperScissorsGameContainer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const cropPreviewRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const landmarksRef = useRef<import("@mediapipe/tasks-vision").NormalizedLandmark[] | null>(
    null,
  );
  const trackingFrameRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const lastMismatchAlertRef = useRef<string | null>(null);

  const [targetPose, setTargetPose] = useState<PoseOption>(getRandomTargetPose);
  const [prediction, setPrediction] = useState("");
  const [confidence, setConfidence] = useState<number | null>(null);
  const [gestureLabel, setGestureLabel] = useState<GestureLabel | "">("");
  const [cnnLabel, setCnnLabel] = useState("");
  const [isMatch, setIsMatch] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [autoCapture, setAutoCapture] = useState(true);
  const [handDetected, setHandDetected] = useState(false);
  const [trackerReady, setTrackerReady] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fingerStatus, setFingerStatus] = useState({
    thumb: false,
    index: false,
    middle: false,
    ring: false,
    pinky: false,
  });

  const syncOverlayCanvasSize = useCallback(() => {
    const video = videoRef.current;
    const overlay = overlayRef.current;

    if (!video || !overlay) {
      return;
    }

    const rect = video.getBoundingClientRect();
    overlay.width = rect.width;
    overlay.height = rect.height;
  }, []);

  const updateCropPreview = useCallback(
    (imageBase64: string | null) => {
      const canvas = cropPreviewRef.current;
      if (!canvas) {
        return;
      }

      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }

      if (!imageBase64) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      const image = new Image();
      image.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
      };
      image.src = `data:image/jpeg;base64,${imageBase64}`;
    },
    [],
  );

  const triggerMismatchAlert = useCallback(
    (challenge: PoseOption, finalPrediction: string) => {
      if (!finalPrediction || checkMatch(challenge, finalPrediction)) {
        lastMismatchAlertRef.current = null;
        return;
      }

      const alertKey = `${challenge}:${finalPrediction}`;
      if (lastMismatchAlertRef.current === alertKey) {
        return;
      }

      lastMismatchAlertRef.current = alertKey;
      toast.error("Tantangan Tidak Sesuai!", {
        description: `Tantangan: ${challenge} · Prediksi Akhir: ${finalPrediction}. Ubah gesture tangan Anda.`,
      });
    },
    [],
  );

  const runDetection = useCallback(async () => {
    if (isDetecting || webcamError || !trackerReady) {
      return;
    }

    const video = videoRef.current;
    const landmarks = landmarksRef.current;

    if (!video || !landmarks) {
      setApiError("Tangan belum terdeteksi. Tunjukkan telapak tangan ke kamera.");
      return;
    }

    const gestureResult = classifyGestureFromLandmarks(
      landmarks,
      video.videoWidth,
      video.videoHeight,
    );

    setFingerStatus(gestureResult.fingers);
    setGestureLabel(gestureResult.label ?? "");

    const imageBase64 = cropHandToBase64(video, landmarks);
    if (!imageBase64) {
      setApiError("Area tangan terlalu kecil. Dekatkan tangan ke kamera.");
      return;
    }

    updateCropPreview(imageBase64);
    setIsDetecting(true);
    setApiError(null);

    try {
      const cnnResult = await predictWebcam(imageBase64);
      setCnnLabel(cnnResult.label);

      const merged = mergePredictions(gestureResult, cnnResult);
      const matched = checkMatch(targetPose, merged.label);

      setPrediction(merged.label);
      setConfidence(merged.confidence);
      setIsMatch(matched);

      if (!matched) {
        triggerMismatchAlert(targetPose, merged.label);
      }
    } catch (error) {
      if (gestureResult.label) {
        const matched = checkMatch(targetPose, gestureResult.label);

        setPrediction(gestureResult.label);
        setConfidence(gestureResult.confidence);
        setIsMatch(matched);
        setCnnLabel("");

        if (!matched) {
          triggerMismatchAlert(targetPose, gestureResult.label);
        }
      }

      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memanggil API prediksi.";
      setApiError(message);
    } finally {
      setIsDetecting(false);
    }
  }, [
    isDetecting,
    targetPose,
    trackerReady,
    updateCropPreview,
    triggerMismatchAlert,
    webcamError,
  ]);

  const handleNewChallenge = useCallback(() => {
    lastMismatchAlertRef.current = null;
    setTargetPose(getRandomTargetPose());
    setPrediction("");
    setConfidence(null);
    setGestureLabel("");
    setCnnLabel("");
    setIsMatch(false);
    setApiError(null);
    updateCropPreview(null);
  }, [updateCropPreview]);

  useEffect(() => {
    let isMounted = true;

    async function startWebcam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          syncOverlayCanvasSize();
        }

        setWebcamError(null);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Gagal mengakses webcam. Periksa izin kamera Anda.";
        setWebcamError(message);
      }
    }

    startWebcam();

    return () => {
      isMounted = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [syncOverlayCanvasSize]);

  useEffect(() => {
    let cancelled = false;

    async function setupTracker() {
      try {
        const landmarker = await initHandTracker();
        if (cancelled) {
          return;
        }

        landmarkerRef.current = landmarker;
        setTrackerReady(true);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Gagal memuat pelacak tangan MediaPipe.";
        setWebcamError(message);
      }
    }

    setupTracker();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const overlay = overlayRef.current;
    const landmarker = landmarkerRef.current;

    if (!video || !overlay || !landmarker || !trackerReady || webcamError) {
      return;
    }

    const trackHands = () => {
      if (video.readyState < video.HAVE_CURRENT_DATA) {
        trackingFrameRef.current = requestAnimationFrame(trackHands);
        return;
      }

      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;

        const result = detectHands(
          landmarker,
          video,
          performance.now(),
        );

        if (result.landmarks.length > 0) {
          const landmarks = result.landmarks[0];
          landmarksRef.current = landmarks;
          setHandDetected(true);
          drawHandOverlay(overlay, landmarks, true);

          const gestureResult = classifyGestureFromLandmarks(
            landmarks,
            video.videoWidth,
            video.videoHeight,
          );
          setFingerStatus(gestureResult.fingers);
        } else {
          landmarksRef.current = null;
          setHandDetected(false);
          clearHandOverlay(overlay);
        }
      }

      trackingFrameRef.current = requestAnimationFrame(trackHands);
    };

    trackingFrameRef.current = requestAnimationFrame(trackHands);

    const handleResize = () => syncOverlayCanvasSize();
    window.addEventListener("resize", handleResize);

    return () => {
      if (trackingFrameRef.current !== null) {
        cancelAnimationFrame(trackingFrameRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [trackerReady, webcamError, syncOverlayCanvasSize]);

  useEffect(() => {
    if (!autoCapture || webcamError || !trackerReady) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (landmarksRef.current) {
        void runDetection();
      }
    }, 1500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [autoCapture, runDetection, trackerReady, webcamError]);

  return (
    <RockPaperScissorsGameSection
      videoRef={videoRef}
      overlayRef={overlayRef}
      cropPreviewRef={cropPreviewRef}
      targetPose={targetPose}
      prediction={prediction}
      gestureLabel={gestureLabel}
      cnnLabel={cnnLabel}
      confidence={confidence}
      isMatch={isMatch}
      isDetecting={isDetecting}
      autoCapture={autoCapture}
      handDetected={handDetected}
      trackerReady={trackerReady}
      fingerStatus={fingerStatus}
      webcamError={webcamError}
      apiError={apiError}
      onToggleAutoCapture={() => setAutoCapture((current) => !current)}
      onDetectPose={() => void runDetection()}
      onNewChallenge={handleNewChallenge}
    />
  );
}
