(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PREDICT_FILE_URL",
    ()=>PREDICT_FILE_URL,
    "PREDICT_WEBCAM_URL",
    ()=>PREDICT_WEBCAM_URL,
    "predictWebcam",
    ()=>predictWebcam
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const API_BASE_URL = ("TURBOPACK compile-time value", "http://127.0.0.1:8000") ?? "http://127.0.0.1:8000";
const PREDICT_WEBCAM_URL = `${API_BASE_URL}/predict/webcam`;
const PREDICT_FILE_URL = `${API_BASE_URL}/predict/file`;
async function predictWebcam(imageBase64) {
    const response = await fetch(PREDICT_WEBCAM_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            image_base64: imageBase64
        })
    });
    if (!response.ok) {
        const errorBody = await response.json().catch(()=>null);
        const message = errorBody?.detail ?? `Prediction request failed with status ${response.status}`;
        throw new Error(typeof message === "string" ? message : "Prediction request failed");
    }
    return response.json();
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/gesture-classifier.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "classifyGestureFromLandmarks",
    ()=>classifyGestureFromLandmarks,
    "getFingerStates",
    ()=>getFingerStates,
    "mergePredictions",
    ()=>mergePredictions
]);
function distance(a, b, width, height) {
    const dx = (a.x - b.x) * width;
    const dy = (a.y - b.y) * height;
    return Math.hypot(dx, dy);
}
function isFingerExtended(landmarks, tip, pip, mcp, wrist, width, height) {
    const tipPoint = landmarks[tip];
    const pipPoint = landmarks[pip];
    const mcpPoint = landmarks[mcp];
    const tipToWrist = distance(tipPoint, wrist, width, height);
    const pipToWrist = distance(pipPoint, wrist, width, height);
    const tipToMcp = distance(tipPoint, mcpPoint, width, height);
    const pipToMcp = distance(pipPoint, mcpPoint, width, height);
    return tipToWrist > pipToWrist * 1.05 && tipToMcp > pipToMcp * 1.15;
}
function isThumbExtended(landmarks, width, height) {
    const wrist = landmarks[0];
    const thumbTip = landmarks[4];
    const thumbIp = landmarks[3];
    const indexMcp = landmarks[5];
    const tipToIp = distance(thumbTip, thumbIp, width, height);
    const ipToMcp = distance(thumbIp, indexMcp, width, height);
    return distance(thumbTip, wrist, width, height) > distance(thumbIp, wrist, width, height) * 1.02 && tipToIp > ipToMcp * 0.65;
}
function getFingerStates(landmarks, frameWidth, frameHeight) {
    const wrist = landmarks[0];
    return {
        thumb: isThumbExtended(landmarks, frameWidth, frameHeight),
        index: isFingerExtended(landmarks, 8, 6, 5, wrist, frameWidth, frameHeight),
        middle: isFingerExtended(landmarks, 12, 10, 9, wrist, frameWidth, frameHeight),
        ring: isFingerExtended(landmarks, 16, 14, 13, wrist, frameWidth, frameHeight),
        pinky: isFingerExtended(landmarks, 20, 18, 17, wrist, frameWidth, frameHeight)
    };
}
function classifyGestureFromLandmarks(landmarks, frameWidth, frameHeight) {
    const fingers = getFingerStates(landmarks, frameWidth, frameHeight);
    const extendedCount = [
        fingers.index,
        fingers.middle,
        fingers.ring,
        fingers.pinky
    ].filter(Boolean).length;
    if (extendedCount === 0) {
        return {
            label: "Batu",
            confidence: 0.92,
            fingers
        };
    }
    if (extendedCount >= 4) {
        return {
            label: "Kertas",
            confidence: 0.9,
            fingers
        };
    }
    if (fingers.index && fingers.middle && !fingers.ring && !fingers.pinky) {
        return {
            label: "Gunting",
            confidence: 0.88,
            fingers
        };
    }
    if (extendedCount === 1 && fingers.index) {
        return {
            label: "Gunting",
            confidence: 0.55,
            fingers
        };
    }
    return {
        label: null,
        confidence: 0,
        fingers
    };
}
function mergePredictions(gesture, cnn) {
    if (!gesture.label && cnn) {
        return {
            label: cnn.label,
            confidence: cnn.confidence_score,
            source: "cnn"
        };
    }
    if (gesture.label && !cnn) {
        return {
            label: gesture.label,
            confidence: gesture.confidence,
            source: "gesture"
        };
    }
    if (gesture.label && cnn) {
        if (gesture.label === cnn.label) {
            return {
                label: gesture.label,
                confidence: Math.min(0.99, gesture.confidence * 0.45 + cnn.confidence_score * 0.55 + 0.1),
                source: "merged"
            };
        }
        if (gesture.confidence >= 0.8) {
            return {
                label: gesture.label,
                confidence: gesture.confidence,
                source: "gesture"
            };
        }
        if (cnn.confidence_score >= 0.7) {
            return {
                label: cnn.label,
                confidence: cnn.confidence_score,
                source: "cnn"
            };
        }
        return {
            label: gesture.label,
            confidence: gesture.confidence,
            source: "gesture"
        };
    }
    return {
        label: "",
        confidence: 0,
        source: "gesture"
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/hand-tracker.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearHandOverlay",
    ()=>clearHandOverlay,
    "cropHandToBase64",
    ()=>cropHandToBase64,
    "detectHands",
    ()=>detectHands,
    "drawHandOverlay",
    ()=>drawHandOverlay,
    "getHandBoundingBox",
    ()=>getHandBoundingBox,
    "initHandTracker",
    ()=>initHandTracker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mediapipe$2f$tasks$2d$vision$2f$vision_bundle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@mediapipe/tasks-vision/vision_bundle.mjs [app-client] (ecmascript)");
;
const WASM_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";
const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
let handLandmarker = null;
async function initHandTracker() {
    if (handLandmarker) {
        return handLandmarker;
    }
    const vision = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mediapipe$2f$tasks$2d$vision$2f$vision_bundle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FilesetResolver"].forVisionTasks(WASM_CDN);
    handLandmarker = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$mediapipe$2f$tasks$2d$vision$2f$vision_bundle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HandLandmarker"].createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 1,
        minHandDetectionConfidence: 0.6,
        minHandPresenceConfidence: 0.6,
        minTrackingConfidence: 0.6
    });
    return handLandmarker;
}
function detectHands(landmarker, video, timestampMs) {
    return landmarker.detectForVideo(video, timestampMs);
}
const HAND_CONNECTIONS = [
    [
        0,
        1
    ],
    [
        1,
        2
    ],
    [
        2,
        3
    ],
    [
        3,
        4
    ],
    [
        0,
        5
    ],
    [
        5,
        6
    ],
    [
        6,
        7
    ],
    [
        7,
        8
    ],
    [
        0,
        9
    ],
    [
        9,
        10
    ],
    [
        10,
        11
    ],
    [
        11,
        12
    ],
    [
        0,
        13
    ],
    [
        13,
        14
    ],
    [
        14,
        15
    ],
    [
        15,
        16
    ],
    [
        0,
        17
    ],
    [
        17,
        18
    ],
    [
        18,
        19
    ],
    [
        19,
        20
    ],
    [
        5,
        9
    ],
    [
        9,
        13
    ],
    [
        13,
        17
    ]
];
function drawHandOverlay(canvas, landmarks, mirrored) {
    const context = canvas.getContext("2d");
    if (!context) {
        return;
    }
    const { width, height } = canvas;
    context.clearRect(0, 0, width, height);
    const toX = (x)=>mirrored ? (1 - x) * width : x * width;
    const toY = (y)=>y * height;
    context.lineWidth = 3;
    context.strokeStyle = "rgba(52, 211, 153, 0.9)";
    context.fillStyle = "rgba(16, 185, 129, 0.95)";
    for (const [start, end] of HAND_CONNECTIONS){
        const from = landmarks[start];
        const to = landmarks[end];
        context.beginPath();
        context.moveTo(toX(from.x), toY(from.y));
        context.lineTo(toX(to.x), toY(to.y));
        context.stroke();
    }
    for (const landmark of landmarks){
        context.beginPath();
        context.arc(toX(landmark.x), toY(landmark.y), 5, 0, Math.PI * 2);
        context.fill();
    }
}
function clearHandOverlay(canvas) {
    const context = canvas.getContext("2d");
    if (!context) {
        return;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
}
function getHandBoundingBox(landmarks, frameWidth, frameHeight, paddingRatio = 0.3) {
    const xs = landmarks.map((landmark)=>landmark.x * frameWidth);
    const ys = landmarks.map((landmark)=>landmark.y * frameHeight);
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
    return {
        x,
        y,
        width,
        height
    };
}
function cropHandToBase64(video, landmarks, outputSize = 300) {
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
    context.drawImage(video, bbox.x, bbox.y, bbox.width, bbox.height, 0, 0, outputSize, outputSize);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    return dataUrl.split(",")[1] ?? null;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/section/rock-paper-scissors-game-section.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RockPaperScissorsGameSection",
    ()=>RockPaperScissorsGameSection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
"use client";
;
const POSE_EMOJI = {
    Batu: "✊",
    Gunting: "✌️",
    Kertas: "✋"
};
const FINGER_LABELS = [
    [
        "thumb",
        "Jempol"
    ],
    [
        "index",
        "Telunjuk"
    ],
    [
        "middle",
        "Tengah"
    ],
    [
        "ring",
        "Manis"
    ],
    [
        "pinky",
        "Kelingking"
    ]
];
function formatConfidence(confidence) {
    if (confidence === null) return "—";
    return `${(confidence * 100).toFixed(1)}%`;
}
function RockPaperScissorsGameSection({ videoRef, overlayRef, cropPreviewRef, targetPose, prediction, gestureLabel, cnnLabel, confidence, isMatch, isDetecting, autoCapture, handDetected, trackerReady, fingerStatus, webcamError, apiError, onToggleAutoCapture, onDetectPose, onNewChallenge }) {
    const showMismatchAlert = Boolean(prediction) && !isMatch;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-slate-950 text-slate-100",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 lg:px-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                    className: "space-y-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm font-medium uppercase tracking-[0.2em] text-emerald-400",
                            children: "Batu Gunting Kertas"
                        }, void 0, false, {
                            fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                            lineNumber: 83,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-3xl font-bold tracking-tight sm:text-4xl",
                            children: "Game Deteksi Gesture Tangan"
                        }, void 0, false, {
                            fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                            lineNumber: 86,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "max-w-2xl text-slate-400",
                            children: "Sistem melacak landmark jari dengan MediaPipe, memotong area tangan, lalu memprediksi Batu/Gunting/Kertas dari gesture dan model CNN."
                        }, void 0, false, {
                            fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                            lineNumber: 89,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                    lineNumber: 82,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid gap-6 lg:grid-cols-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            className: "overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 shadow-2xl shadow-black/30",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "border-b border-slate-800 px-5 py-4",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                        className: "text-lg font-semibold",
                                                        children: "Live Webcam"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                        lineNumber: 100,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm text-slate-400",
                                                        children: "Tunjukkan satu tangan dengan jari terlihat jelas."
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                        lineNumber: 101,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                lineNumber: 99,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: `rounded-full px-3 py-1 text-xs font-semibold ${handDetected ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`,
                                                children: handDetected ? "Tangan Terdeteksi" : "Mencari Tangan..."
                                            }, void 0, false, {
                                                fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                lineNumber: 105,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                        lineNumber: 98,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                    lineNumber: 97,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative aspect-[4/3] bg-slate-950",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("video", {
                                            ref: videoRef,
                                            autoPlay: true,
                                            playsInline: true,
                                            muted: true,
                                            className: "h-full w-full -scale-x-100 object-cover"
                                        }, void 0, false, {
                                            fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                            lineNumber: 118,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
                                            ref: overlayRef,
                                            className: "pointer-events-none absolute inset-0 h-full w-full"
                                        }, void 0, false, {
                                            fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                            lineNumber: 125,
                                            columnNumber: 15
                                        }, this),
                                        !trackerReady && !webcamError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute inset-0 flex items-center justify-center bg-slate-950/70",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-slate-300",
                                                children: "Memuat pelacak tangan MediaPipe..."
                                            }, void 0, false, {
                                                fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                lineNumber: 132,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                            lineNumber: 131,
                                            columnNumber: 17
                                        }, this) : null,
                                        webcamError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute inset-0 flex items-center justify-center bg-slate-950/90 p-6 text-center",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-rose-300",
                                                children: webcamError
                                            }, void 0, false, {
                                                fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                lineNumber: 140,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                            lineNumber: 139,
                                            columnNumber: 17
                                        }, this) : null
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                    lineNumber: 117,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid gap-4 border-t border-slate-800 p-5 sm:grid-cols-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500",
                                                    children: "Status Jari"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                    lineNumber: 147,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-wrap gap-2",
                                                    children: FINGER_LABELS.map(([key, label])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `rounded-lg px-2.5 py-1 text-xs font-medium ${fingerStatus[key] ? "bg-cyan-500/15 text-cyan-300" : "bg-slate-800 text-slate-500"}`,
                                                            children: [
                                                                label,
                                                                ": ",
                                                                fingerStatus[key] ? "Terbuka" : "Tertutup"
                                                            ]
                                                        }, key, true, {
                                                            fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                            lineNumber: 152,
                                                            columnNumber: 21
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                    lineNumber: 150,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                            lineNumber: 146,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500",
                                                    children: "Crop Tangan (300×300)"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                    lineNumber: 167,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
                                                    ref: cropPreviewRef,
                                                    width: 120,
                                                    height: 120,
                                                    className: "rounded-xl border border-slate-700 bg-slate-950"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                    lineNumber: 170,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                            lineNumber: 166,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                    lineNumber: 145,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap gap-3 border-t border-slate-800 p-5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: onDetectPose,
                                            disabled: isDetecting || !!webcamError || !handDetected,
                                            className: "rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50",
                                            children: isDetecting ? "Mendeteksi..." : "Deteksi Pose"
                                        }, void 0, false, {
                                            fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                            lineNumber: 180,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: onToggleAutoCapture,
                                            disabled: !!webcamError,
                                            className: `rounded-xl border px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${autoCapture ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-300" : "border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-600"}`,
                                            children: autoCapture ? "Auto Capture: ON" : "Auto Capture: OFF"
                                        }, void 0, false, {
                                            fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                            lineNumber: 189,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                    lineNumber: 179,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                            lineNumber: 96,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            className: `rounded-3xl border bg-slate-900/60 p-6 shadow-2xl shadow-black/30 transition ${isMatch ? "border-emerald-400/80 shadow-emerald-500/20 ring-2 ring-emerald-400/40" : showMismatchAlert ? "border-rose-400/80 shadow-rose-500/20 ring-2 ring-rose-400/40" : "border-slate-800"}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-6 flex items-start justify-between gap-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                    className: "text-lg font-semibold",
                                                    children: "Game Dashboard"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                    lineNumber: 215,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm text-slate-400",
                                                    children: "Cocokkan gesture tangan dengan tantangan."
                                                }, void 0, false, {
                                                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                    lineNumber: 216,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                            lineNumber: 214,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: onNewChallenge,
                                            className: "rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600",
                                            children: "Tantangan Baru"
                                        }, void 0, false, {
                                            fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                            lineNumber: 221,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                    lineNumber: 213,
                                    columnNumber: 13
                                }, this),
                                isMatch ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-6 flex items-center gap-3 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-emerald-300",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-2xl",
                                            children: "✓"
                                        }, void 0, false, {
                                            fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                            lineNumber: 232,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-lg font-bold",
                                                    children: "Berhasil!"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                    lineNumber: 234,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm text-emerald-200/80",
                                                    children: "Gesture tangan Anda sesuai tantangan."
                                                }, void 0, false, {
                                                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                    lineNumber: 235,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                            lineNumber: 233,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                    lineNumber: 231,
                                    columnNumber: 15
                                }, this) : null,
                                showMismatchAlert ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    role: "alert",
                                    className: "mb-6 flex items-start gap-3 rounded-2xl border border-rose-400/50 bg-rose-500/15 px-4 py-3 text-rose-200",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-2xl",
                                            children: "✕"
                                        }, void 0, false, {
                                            fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                            lineNumber: 247,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-lg font-bold text-rose-300",
                                                    children: "Tantangan Tidak Sesuai!"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                    lineNumber: 249,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "mt-1 text-sm text-rose-200/90",
                                                    children: [
                                                        "Tantangan:",
                                                        " ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "font-semibold text-white",
                                                            children: targetPose
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                            lineNumber: 254,
                                                            columnNumber: 21
                                                        }, this),
                                                        " · ",
                                                        "Prediksi Akhir:",
                                                        " ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "font-semibold text-white",
                                                            children: prediction
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                            lineNumber: 257,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                    lineNumber: 252,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "mt-1 text-sm text-rose-200/70",
                                                    children: "Ubah gesture tangan Anda agar sesuai dengan tantangan."
                                                }, void 0, false, {
                                                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                    lineNumber: 259,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                            lineNumber: 248,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                    lineNumber: 243,
                                    columnNumber: 15
                                }, this) : null,
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid gap-4 sm:grid-cols-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                            className: "rounded-2xl border border-slate-800 bg-slate-950/70 p-5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs font-semibold uppercase tracking-[0.18em] text-slate-500",
                                                    children: "Tantangan"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                    lineNumber: 268,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "mt-3 flex items-center gap-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-4xl",
                                                            children: targetPose === "Gambar Acak" ? "🎲" : POSE_EMOJI[targetPose]
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                            lineNumber: 272,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-2xl font-bold text-white",
                                                            children: targetPose
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                            lineNumber: 277,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                    lineNumber: 271,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                            lineNumber: 267,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                            className: "rounded-2xl border border-slate-800 bg-slate-950/70 p-5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs font-semibold uppercase tracking-[0.18em] text-slate-500",
                                                    children: "Prediksi Akhir"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                    lineNumber: 282,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "mt-3 text-2xl font-bold text-cyan-300",
                                                    children: prediction || "Menunggu tangan..."
                                                }, void 0, false, {
                                                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                    lineNumber: 285,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                            lineNumber: 281,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                            className: "rounded-2xl border border-slate-800 bg-slate-950/70 p-5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs font-semibold uppercase tracking-[0.18em] text-slate-500",
                                                    children: "Gesture Jari (MediaPipe)"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                    lineNumber: 291,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "mt-3 text-xl font-semibold text-emerald-300",
                                                    children: gestureLabel || "—"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                    lineNumber: 294,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                            lineNumber: 290,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                            className: "rounded-2xl border border-slate-800 bg-slate-950/70 p-5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs font-semibold uppercase tracking-[0.18em] text-slate-500",
                                                    children: "Model CNN (Crop Tangan)"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                    lineNumber: 300,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "mt-3 text-xl font-semibold text-violet-300",
                                                    children: cnnLabel || "—"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                    lineNumber: 303,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                            lineNumber: 299,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                            className: "rounded-2xl border border-slate-800 bg-slate-950/70 p-5 sm:col-span-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs font-semibold uppercase tracking-[0.18em] text-slate-500",
                                                    children: "Confidence Score"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                    lineNumber: 309,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "mt-3 flex items-end gap-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-3xl font-bold text-amber-300",
                                                            children: formatConfidence(confidence)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                            lineNumber: 313,
                                                            columnNumber: 19
                                                        }, this),
                                                        confidence !== null ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "mb-1 h-2 flex-1 overflow-hidden rounded-full bg-slate-800",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500",
                                                                style: {
                                                                    width: `${Math.min(confidence * 100, 100)}%`
                                                                }
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                                lineNumber: 318,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                            lineNumber: 317,
                                                            columnNumber: 21
                                                        }, this) : null
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                                    lineNumber: 312,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                            lineNumber: 308,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                    lineNumber: 266,
                                    columnNumber: 13
                                }, this),
                                apiError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200",
                                    children: apiError
                                }, void 0, false, {
                                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                    lineNumber: 329,
                                    columnNumber: 15
                                }, this) : null,
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-6 text-sm text-slate-500",
                                    children: autoCapture ? "Area tangan dipotong otomatis setiap 1,5 detik, lalu diklasifikasi dari gesture jari + CNN." : 'Klik "Deteksi Pose" setelah tangan terdeteksi (kotak hijau di webcam).'
                                }, void 0, false, {
                                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                                    lineNumber: 334,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                            lineNumber: 204,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
                    lineNumber: 95,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
            lineNumber: 81,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/section/rock-paper-scissors-game-section.tsx",
        lineNumber: 80,
        columnNumber: 5
    }, this);
}
_c = RockPaperScissorsGameSection;
var _c;
__turbopack_context__.k.register(_c, "RockPaperScissorsGameSection");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/container/rock-paper-scissors-game-container.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RockPaperScissorsGameContainer",
    ()=>RockPaperScissorsGameContainer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gesture$2d$classifier$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/gesture-classifier.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hand$2d$tracker$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/hand-tracker.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$section$2f$rock$2d$paper$2d$scissors$2d$game$2d$section$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/section/rock-paper-scissors-game-section.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
const POSE_OPTIONS = [
    "Batu",
    "Gunting",
    "Kertas",
    "Gambar Acak"
];
const VALID_POSES = [
    "Batu",
    "Gunting",
    "Kertas"
];
function getRandomTargetPose() {
    return POSE_OPTIONS[Math.floor(Math.random() * POSE_OPTIONS.length)];
}
function checkMatch(targetPose, prediction) {
    if (targetPose === "Gambar Acak") {
        return VALID_POSES.includes(prediction);
    }
    return prediction === targetPose;
}
function RockPaperScissorsGameContainer() {
    _s();
    const videoRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const overlayRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const cropPreviewRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const streamRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const landmarkerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const landmarksRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const trackingFrameRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const lastVideoTimeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(-1);
    const lastMismatchAlertRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [targetPose, setTargetPose] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(getRandomTargetPose);
    const [prediction, setPrediction] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [confidence, setConfidence] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [gestureLabel, setGestureLabel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [cnnLabel, setCnnLabel] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [isMatch, setIsMatch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isDetecting, setIsDetecting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [autoCapture, setAutoCapture] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [handDetected, setHandDetected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [trackerReady, setTrackerReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [webcamError, setWebcamError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [apiError, setApiError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [fingerStatus, setFingerStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        thumb: false,
        index: false,
        middle: false,
        ring: false,
        pinky: false
    });
    const syncOverlayCanvasSize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "RockPaperScissorsGameContainer.useCallback[syncOverlayCanvasSize]": ()=>{
            const video = videoRef.current;
            const overlay = overlayRef.current;
            if (!video || !overlay) {
                return;
            }
            const rect = video.getBoundingClientRect();
            overlay.width = rect.width;
            overlay.height = rect.height;
        }
    }["RockPaperScissorsGameContainer.useCallback[syncOverlayCanvasSize]"], []);
    const updateCropPreview = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "RockPaperScissorsGameContainer.useCallback[updateCropPreview]": (imageBase64)=>{
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
            image.onload = ({
                "RockPaperScissorsGameContainer.useCallback[updateCropPreview]": ()=>{
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    context.drawImage(image, 0, 0, canvas.width, canvas.height);
                }
            })["RockPaperScissorsGameContainer.useCallback[updateCropPreview]"];
            image.src = `data:image/jpeg;base64,${imageBase64}`;
        }
    }["RockPaperScissorsGameContainer.useCallback[updateCropPreview]"], []);
    const triggerMismatchAlert = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "RockPaperScissorsGameContainer.useCallback[triggerMismatchAlert]": (challenge, finalPrediction)=>{
            if (!finalPrediction || checkMatch(challenge, finalPrediction)) {
                lastMismatchAlertRef.current = null;
                return;
            }
            const alertKey = `${challenge}:${finalPrediction}`;
            if (lastMismatchAlertRef.current === alertKey) {
                return;
            }
            lastMismatchAlertRef.current = alertKey;
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Tantangan Tidak Sesuai!", {
                description: `Tantangan: ${challenge} · Prediksi Akhir: ${finalPrediction}. Ubah gesture tangan Anda.`
            });
        }
    }["RockPaperScissorsGameContainer.useCallback[triggerMismatchAlert]"], []);
    const runDetection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "RockPaperScissorsGameContainer.useCallback[runDetection]": async ()=>{
            if (isDetecting || webcamError || !trackerReady) {
                return;
            }
            const video = videoRef.current;
            const landmarks = landmarksRef.current;
            if (!video || !landmarks) {
                setApiError("Tangan belum terdeteksi. Tunjukkan telapak tangan ke kamera.");
                return;
            }
            const gestureResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gesture$2d$classifier$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["classifyGestureFromLandmarks"])(landmarks, video.videoWidth, video.videoHeight);
            setFingerStatus(gestureResult.fingers);
            setGestureLabel(gestureResult.label ?? "");
            const imageBase64 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hand$2d$tracker$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cropHandToBase64"])(video, landmarks);
            if (!imageBase64) {
                setApiError("Area tangan terlalu kecil. Dekatkan tangan ke kamera.");
                return;
            }
            updateCropPreview(imageBase64);
            setIsDetecting(true);
            setApiError(null);
            try {
                const cnnResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["predictWebcam"])(imageBase64);
                setCnnLabel(cnnResult.label);
                const merged = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gesture$2d$classifier$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mergePredictions"])(gestureResult, cnnResult);
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
                const message = error instanceof Error ? error.message : "Terjadi kesalahan saat memanggil API prediksi.";
                setApiError(message);
            } finally{
                setIsDetecting(false);
            }
        }
    }["RockPaperScissorsGameContainer.useCallback[runDetection]"], [
        isDetecting,
        targetPose,
        trackerReady,
        updateCropPreview,
        triggerMismatchAlert,
        webcamError
    ]);
    const handleNewChallenge = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "RockPaperScissorsGameContainer.useCallback[handleNewChallenge]": ()=>{
            lastMismatchAlertRef.current = null;
            setTargetPose(getRandomTargetPose());
            setPrediction("");
            setConfidence(null);
            setGestureLabel("");
            setCnnLabel("");
            setIsMatch(false);
            setApiError(null);
            updateCropPreview(null);
        }
    }["RockPaperScissorsGameContainer.useCallback[handleNewChallenge]"], [
        updateCropPreview
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RockPaperScissorsGameContainer.useEffect": ()=>{
            let isMounted = true;
            async function startWebcam() {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            facingMode: "user",
                            width: {
                                ideal: 1280
                            },
                            height: {
                                ideal: 720
                            }
                        },
                        audio: false
                    });
                    if (!isMounted) {
                        stream.getTracks().forEach({
                            "RockPaperScissorsGameContainer.useEffect.startWebcam": (track)=>track.stop()
                        }["RockPaperScissorsGameContainer.useEffect.startWebcam"]);
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
                    const message = error instanceof Error ? error.message : "Gagal mengakses webcam. Periksa izin kamera Anda.";
                    setWebcamError(message);
                }
            }
            startWebcam();
            return ({
                "RockPaperScissorsGameContainer.useEffect": ()=>{
                    isMounted = false;
                    streamRef.current?.getTracks().forEach({
                        "RockPaperScissorsGameContainer.useEffect": (track)=>track.stop()
                    }["RockPaperScissorsGameContainer.useEffect"]);
                    streamRef.current = null;
                }
            })["RockPaperScissorsGameContainer.useEffect"];
        }
    }["RockPaperScissorsGameContainer.useEffect"], [
        syncOverlayCanvasSize
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RockPaperScissorsGameContainer.useEffect": ()=>{
            let cancelled = false;
            async function setupTracker() {
                try {
                    const landmarker = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hand$2d$tracker$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initHandTracker"])();
                    if (cancelled) {
                        return;
                    }
                    landmarkerRef.current = landmarker;
                    setTrackerReady(true);
                } catch (error) {
                    const message = error instanceof Error ? error.message : "Gagal memuat pelacak tangan MediaPipe.";
                    setWebcamError(message);
                }
            }
            setupTracker();
            return ({
                "RockPaperScissorsGameContainer.useEffect": ()=>{
                    cancelled = true;
                }
            })["RockPaperScissorsGameContainer.useEffect"];
        }
    }["RockPaperScissorsGameContainer.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RockPaperScissorsGameContainer.useEffect": ()=>{
            const video = videoRef.current;
            const overlay = overlayRef.current;
            const landmarker = landmarkerRef.current;
            if (!video || !overlay || !landmarker || !trackerReady || webcamError) {
                return;
            }
            const trackHands = {
                "RockPaperScissorsGameContainer.useEffect.trackHands": ()=>{
                    if (video.readyState < video.HAVE_CURRENT_DATA) {
                        trackingFrameRef.current = requestAnimationFrame(trackHands);
                        return;
                    }
                    if (video.currentTime !== lastVideoTimeRef.current) {
                        lastVideoTimeRef.current = video.currentTime;
                        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hand$2d$tracker$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["detectHands"])(landmarker, video, performance.now());
                        if (result.landmarks.length > 0) {
                            const landmarks = result.landmarks[0];
                            landmarksRef.current = landmarks;
                            setHandDetected(true);
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hand$2d$tracker$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["drawHandOverlay"])(overlay, landmarks, true);
                            const gestureResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gesture$2d$classifier$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["classifyGestureFromLandmarks"])(landmarks, video.videoWidth, video.videoHeight);
                            setFingerStatus(gestureResult.fingers);
                        } else {
                            landmarksRef.current = null;
                            setHandDetected(false);
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hand$2d$tracker$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearHandOverlay"])(overlay);
                        }
                    }
                    trackingFrameRef.current = requestAnimationFrame(trackHands);
                }
            }["RockPaperScissorsGameContainer.useEffect.trackHands"];
            trackingFrameRef.current = requestAnimationFrame(trackHands);
            const handleResize = {
                "RockPaperScissorsGameContainer.useEffect.handleResize": ()=>syncOverlayCanvasSize()
            }["RockPaperScissorsGameContainer.useEffect.handleResize"];
            window.addEventListener("resize", handleResize);
            return ({
                "RockPaperScissorsGameContainer.useEffect": ()=>{
                    if (trackingFrameRef.current !== null) {
                        cancelAnimationFrame(trackingFrameRef.current);
                    }
                    window.removeEventListener("resize", handleResize);
                }
            })["RockPaperScissorsGameContainer.useEffect"];
        }
    }["RockPaperScissorsGameContainer.useEffect"], [
        trackerReady,
        webcamError,
        syncOverlayCanvasSize
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RockPaperScissorsGameContainer.useEffect": ()=>{
            if (!autoCapture || webcamError || !trackerReady) {
                return;
            }
            const intervalId = window.setInterval({
                "RockPaperScissorsGameContainer.useEffect.intervalId": ()=>{
                    if (landmarksRef.current) {
                        void runDetection();
                    }
                }
            }["RockPaperScissorsGameContainer.useEffect.intervalId"], 1500);
            return ({
                "RockPaperScissorsGameContainer.useEffect": ()=>{
                    window.clearInterval(intervalId);
                }
            })["RockPaperScissorsGameContainer.useEffect"];
        }
    }["RockPaperScissorsGameContainer.useEffect"], [
        autoCapture,
        runDetection,
        trackerReady,
        webcamError
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$section$2f$rock$2d$paper$2d$scissors$2d$game$2d$section$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RockPaperScissorsGameSection"], {
        videoRef: videoRef,
        overlayRef: overlayRef,
        cropPreviewRef: cropPreviewRef,
        targetPose: targetPose,
        prediction: prediction,
        gestureLabel: gestureLabel,
        cnnLabel: cnnLabel,
        confidence: confidence,
        isMatch: isMatch,
        isDetecting: isDetecting,
        autoCapture: autoCapture,
        handDetected: handDetected,
        trackerReady: trackerReady,
        fingerStatus: fingerStatus,
        webcamError: webcamError,
        apiError: apiError,
        onToggleAutoCapture: ()=>setAutoCapture((current)=>!current),
        onDetectPose: ()=>void runDetection(),
        onNewChallenge: handleNewChallenge
    }, void 0, false, {
        fileName: "[project]/src/container/rock-paper-scissors-game-container.tsx",
        lineNumber: 371,
        columnNumber: 5
    }, this);
}
_s(RockPaperScissorsGameContainer, "IbY8Ti01qhZnDryGZs/TMEP0RpY=");
_c = RockPaperScissorsGameContainer;
var _c;
__turbopack_context__.k.register(_c, "RockPaperScissorsGameContainer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_0qzp93x._.js.map