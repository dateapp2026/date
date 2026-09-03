import { API_BASE_URL } from "@/constants/api";
import { getToken } from "@/lib/auth";

export type Photo = {
  id: string;
  url: string;
  position: number;
  created_at: string;
};

type PresignResponse = {
  upload_url: string;
  key: string;
  url: string;
  expires_in: number;
};

const SUPPORTED_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  if (!token) {
    throw new Error("You need to be logged in to do that.");
  }
  return { Authorization: `Bearer ${token}` };
}

async function parseJsonResponse(response: Response) {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error ?? "Something went wrong. Please try again.");
  }
  return body;
}

export async function uploadPhoto(
  localUri: string,
  mimeType: string | null | undefined,
  position: number
): Promise<Photo> {
  if (!mimeType || !SUPPORTED_CONTENT_TYPES.has(mimeType)) {
    throw new Error("Please choose a JPEG, PNG, or WEBP photo.");
  }

  const presignResponse = await fetch(`${API_BASE_URL}/photos/presign-upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ content_type: mimeType }),
  });
  const { upload_url, key } = (await parseJsonResponse(presignResponse)) as PresignResponse;

  const fileResponse = await fetch(localUri);
  const fileBlob = await fileResponse.blob();

  const uploadResponse = await fetch(upload_url, {
    method: "PUT",
    headers: { "Content-Type": mimeType },
    body: fileBlob,
  });
  if (!uploadResponse.ok) {
    throw new Error("Failed to upload photo. Please try again.");
  }

  const confirmResponse = await fetch(`${API_BASE_URL}/photos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ key, position }),
  });
  return (await parseJsonResponse(confirmResponse)) as Photo;
}

export async function listPhotos(): Promise<Photo[]> {
  const response = await fetch(`${API_BASE_URL}/photos`, {
    headers: await authHeaders(),
  });
  return (await parseJsonResponse(response)) as Photo[];
}

export async function deletePhoto(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/photos/${id}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  await parseJsonResponse(response);
}
