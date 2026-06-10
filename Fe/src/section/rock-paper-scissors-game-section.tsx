"use client";

import type { RefObject } from "react";

type PoseOption = "Batu" | "Gunting" | "Kertas" | "Gambar Acak";

type FingerStatus = {
  thumb: boolean;
  index: boolean;
  middle: boolean;
  ring: boolean;
  pinky: boolean;
};

type RockPaperScissorsGameSectionProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  overlayRef: RefObject<HTMLCanvasElement | null>;
  cropPreviewRef: RefObject<HTMLCanvasElement | null>;
  targetPose: PoseOption;
  prediction: string;
  gestureLabel: string;
  cnnLabel: string;
  confidence: number | null;
  isMatch: boolean;
  isDetecting: boolean;
  autoCapture: boolean;
  handDetected: boolean;
  trackerReady: boolean;
  fingerStatus: FingerStatus;
  webcamError: string | null;
  apiError: string | null;
  onToggleAutoCapture: () => void;
  onDetectPose: () => void;
  onNewChallenge: () => void;
};

const POSE_EMOJI: Record<Exclude<PoseOption, "Gambar Acak">, string> = {
  Batu: "✊",
  Gunting: "✌️",
  Kertas: "✋",
};

const FINGER_LABELS: Array<[keyof FingerStatus, string]> = [
  ["thumb", "Jempol"],
  ["index", "Telunjuk"],
  ["middle", "Tengah"],
  ["ring", "Manis"],
  ["pinky", "Kelingking"],
];

function formatConfidence(confidence: number | null) {
  if (confidence === null) return "—";
  return `${(confidence * 100).toFixed(1)}%`;
}

export function RockPaperScissorsGameSection({
  videoRef,
  overlayRef,
  cropPreviewRef,
  targetPose,
  prediction,
  gestureLabel,
  cnnLabel,
  confidence,
  isMatch,
  isDetecting,
  autoCapture,
  handDetected,
  trackerReady,
  fingerStatus,
  webcamError,
  apiError,
  onToggleAutoCapture,
  onDetectPose,
  onNewChallenge,
}: RockPaperScissorsGameSectionProps) {
  const showMismatchAlert = Boolean(prediction) && !isMatch;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 lg:px-8">
        <header className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-400">
            Batu Gunting Kertas
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Game Deteksi Gesture Tangan
          </h1>
          <p className="max-w-2xl text-slate-400">
            Sistem melacak landmark jari dengan MediaPipe, memotong area tangan,
            lalu memprediksi Batu/Gunting/Kertas dari gesture dan model CNN.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 shadow-2xl shadow-black/30">
            <div className="border-b border-slate-800 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Live Webcam</h2>
                  <p className="text-sm text-slate-400">
                    Tunjukkan satu tangan dengan jari terlihat jelas.
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    handDetected
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-amber-500/15 text-amber-300"
                  }`}
                >
                  {handDetected ? "Tangan Terdeteksi" : "Mencari Tangan..."}
                </span>
              </div>
            </div>

            <div className="relative aspect-[4/3] bg-slate-950">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full -scale-x-100 object-cover"
              />
              <canvas
                ref={overlayRef}
                className="pointer-events-none absolute inset-0 h-full w-full"
              />

              {!trackerReady && !webcamError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70">
                  <p className="text-sm text-slate-300">
                    Memuat pelacak tangan MediaPipe...
                  </p>
                </div>
              ) : null}

              {webcamError ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 p-6 text-center">
                  <p className="text-sm text-rose-300">{webcamError}</p>
                </div>
              ) : null}
            </div>

            <div className="grid gap-4 border-t border-slate-800 p-5 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Status Jari
                </p>
                <div className="flex flex-wrap gap-2">
                  {FINGER_LABELS.map(([key, label]) => (
                    <span
                      key={key}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                        fingerStatus[key]
                          ? "bg-cyan-500/15 text-cyan-300"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {label}: {fingerStatus[key] ? "Terbuka" : "Tertutup"}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Crop Tangan (300×300)
                </p>
                <canvas
                  ref={cropPreviewRef}
                  width={120}
                  height={120}
                  className="rounded-xl border border-slate-700 bg-slate-950"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-slate-800 p-5">
              <button
                type="button"
                onClick={onDetectPose}
                disabled={isDetecting || !!webcamError || !handDetected}
                className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDetecting ? "Mendeteksi..." : "Deteksi Pose"}
              </button>

              <button
                type="button"
                onClick={onToggleAutoCapture}
                disabled={!!webcamError}
                className={`rounded-xl border px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  autoCapture
                    ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-300"
                    : "border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-600"
                }`}
              >
                {autoCapture ? "Auto Capture: ON" : "Auto Capture: OFF"}
              </button>
            </div>
          </section>

          <section
            className={`rounded-3xl border bg-slate-900/60 p-6 shadow-2xl shadow-black/30 transition ${
              isMatch
                ? "border-emerald-400/80 shadow-emerald-500/20 ring-2 ring-emerald-400/40"
                : showMismatchAlert
                  ? "border-rose-400/80 shadow-rose-500/20 ring-2 ring-rose-400/40"
                  : "border-slate-800"
            }`}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Game Dashboard</h2>
                <p className="text-sm text-slate-400">
                  Cocokkan gesture tangan dengan tantangan.
                </p>
              </div>

              <button
                type="button"
                onClick={onNewChallenge}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600"
              >
                Tantangan Baru
              </button>
            </div>

            {isMatch ? (
              <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-emerald-300">
                <span className="text-2xl">✓</span>
                <div>
                  <p className="text-lg font-bold">Berhasil!</p>
                  <p className="text-sm text-emerald-200/80">
                    Gesture tangan Anda sesuai tantangan.
                  </p>
                </div>
              </div>
            ) : null}

            {showMismatchAlert ? (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-400/50 bg-rose-500/15 px-4 py-3 text-rose-200"
              >
                <span className="text-2xl">✕</span>
                <div>
                  <p className="text-lg font-bold text-rose-300">
                    Tantangan Tidak Sesuai!
                  </p>
                  <p className="mt-1 text-sm text-rose-200/90">
                    Tantangan:{" "}
                    <span className="font-semibold text-white">
                      {targetPose}
                    </span>
                    {" · "}
                    Prediksi Akhir:{" "}
                    <span className="font-semibold text-white">
                      {prediction}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-rose-200/70">
                    Ubah gesture tangan Anda agar sesuai dengan tantangan.
                  </p>
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Tantangan
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-4xl">
                    {targetPose === "Gambar Acak"
                      ? "🎲"
                      : POSE_EMOJI[targetPose]}
                  </span>
                  <p className="text-2xl font-bold text-white">{targetPose}</p>
                </div>
              </article>

              <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Prediksi Akhir
                </p>
                <p className="mt-3 text-2xl font-bold text-cyan-300">
                  {prediction || "Menunggu tangan..."}
                </p>
              </article>

              <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Gesture Jari (MediaPipe)
                </p>
                <p className="mt-3 text-xl font-semibold text-emerald-300">
                  {gestureLabel || "—"}
                </p>
              </article>

              <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Model CNN (Crop Tangan)
                </p>
                <p className="mt-3 text-xl font-semibold text-violet-300">
                  {cnnLabel || "—"}
                </p>
              </article>

              <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Confidence Score
                </p>
                <div className="mt-3 flex items-end gap-3">
                  <p className="text-3xl font-bold text-amber-300">
                    {formatConfidence(confidence)}
                  </p>
                  {confidence !== null ? (
                    <div className="mb-1 h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500"
                        style={{ width: `${Math.min(confidence * 100, 100)}%` }}
                      />
                    </div>
                  ) : null}
                </div>
              </article>
            </div>

            {apiError ? (
              <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {apiError}
              </div>
            ) : null}

            <p className="mt-6 text-sm text-slate-500">
              {autoCapture
                ? "Area tangan dipotong otomatis setiap 1,5 detik, lalu diklasifikasi dari gesture jari + CNN."
                : 'Klik "Deteksi Pose" setelah tangan terdeteksi (kotak hijau di webcam).'}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
