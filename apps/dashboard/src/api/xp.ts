import { Address } from "../constants/address";
import { XpConfig } from "../types/xp";
import { isDev } from "solid-js";

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
  const baseBack = isDev ? Address.LOCALHOSTNUMBACK : Address.BACKEND;

  return baseBack + '/api/' + endpoint;
}

export const OAUTH_URI = isDev ? `${Address.LOCALHOSTNUMBACK}/oauth/callback` : `${Address.BACKEND}/oauth/callback`;
