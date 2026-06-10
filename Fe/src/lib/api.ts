const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export const PREDICT_WEBCAM_URL = `${API_BASE_URL}/predict/webcam`;
export const PREDICT_FILE_URL = `${API_BASE_URL}/predict/file`;

export type PredictResponse = {
  label: string;
  confidence_score: number;
};

export async function predictWebcam(
  imageBase64: string,
): Promise<PredictResponse> {
  const response = await fetch(PREDICT_WEBCAM_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ image_base64: imageBase64 }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message =
      errorBody?.detail ??
      `Prediction request failed with status ${response.status}`;
    throw new Error(
      typeof message === "string" ? message : "Prediction request failed",
    );
  }

  return response.json();
}
