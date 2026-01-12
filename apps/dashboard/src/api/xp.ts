import { Address } from "../constants/address";
import { XpConfig } from "../types/xp";

// src/api/xp.ts
export async function fetchXpConfig(): Promise<XpConfig> {
    const res = await fetch(apiUri('xp/fullXpConfig'), {
        credentials: "include",
      });      
    if (!res.ok) throw new Error("Failed to fetch XP config");
    return res.json();
  }
  
export async function updateXpConfig(
patch: Partial<XpConfig>
) {
    const res = await fetch(apiUri('xp/fullXpConfig'), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch)
    });

    if (!res.ok) throw new Error("Failed to update XP config");
}

export function apiUri(endpoint: string) : string {
  const baseBack = import.meta.env ? Address.LOCALHOSTNUMBACK : Address.BACKEND;
  const baseFront = import.meta.env ? Address.LOCALHOSTNUMFRONT : Address.FRONTEND;

  return baseBack + '/api/' + endpoint;
}

export const OAUTH_URI = import.meta.env ? `${Address.LOCALHOSTNUMBACK}/oauth/callback` : `${Address.BACKEND}/oauth/callback`;