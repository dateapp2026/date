import { API_BASE_URL } from "@/constants/api";
import { getToken } from "@/lib/auth";

export type DiscoverPhoto = {
  id: string;
  url: string;
  position: number;
};

export type Candidate = {
  id: string;
  first_name: string;
  age: number;
  bio: string | null;
  photos: DiscoverPhoto[];
};

export type SwipeResult = {
  matched: boolean;
  match_id?: string;
};

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

export async function getDiscoverCandidates(): Promise<Candidate[]> {
  const response = await fetch(`${API_BASE_URL}/discover`, {
    headers: await authHeaders(),
  });
  return (await parseJsonResponse(response)) as Candidate[];
}

export async function swipe(swipeeId: string, liked: boolean): Promise<SwipeResult> {
  const response = await fetch(`${API_BASE_URL}/swipes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ swipee_id: swipeeId, liked }),
  });
  return (await parseJsonResponse(response)) as SwipeResult;
}
