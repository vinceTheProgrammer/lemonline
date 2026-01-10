// TODO THIS IS COPY/PASTED TO THE FRONTEND!!!!!, IF YOU UPDATE HERE, UPDATE THERE!!!!
export type ChannelXpRule = {
    channelId: string;
  
    baseMessageCreateAmount: number;
    baseThreadCreateAmount: number;
  
    multiplier: number;
    expiration: string | null;
};

export interface LevelRole {
  level: number;
  roleId: string;
  result: "gain" | "lose";
}

export interface XpConfig {
  channelXpRules: ChannelXpRule[],
  levelRoles: LevelRole[];
  serverCooldownSeconds: number;
  levelFormula: string;
}

export interface ChannelNameIdType {
  id: string,
  name: string,
  type: "text" | "voice" | "forum" | "announcement" | "thread_public" | "thread_private" | "thread_announcement" | "category" | "media" | "directory" | "stage" | "dm" | "dm_group" | "unknown"
}
// TODO THIS IS COPY/PASTED TO THE FRONTEND!!!!!, IF YOU UPDATE HERE, UPDATE THERE!!!!

// TODO MIRRORED ON THE FRONTEND
export type LevelRoleConfig = {
  id: number;          // optional for unsaved/new entries
  levelId: number;
  roleId: string;
  gained: boolean;
};

export type LevelRolePreview = {
  id: number;
  roleId: string;
  name: string;
  color: number;
  gained: boolean;
};

export type LevelPreviewRow = {
  level: number;
  totalXp: number;
  roles: LevelRolePreview[];
};

export type LevelRolesPreviewResponse =
  | { ok: true; levels: LevelPreviewRow[] }
  | { ok: false; error: string };
// TODO MIRRORED ON THE FRONTEND