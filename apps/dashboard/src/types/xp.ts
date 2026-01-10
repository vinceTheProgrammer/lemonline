// TODO THIS IS COPY/PASTED TO THE BACKEND!!!!!, IF YOU UPDATE HERE, UPDATE THERE!!!!
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
// TODO THIS IS COPY/PASTED TO THE BACKEND!!!!!, IF YOU UPDATE HERE, UPDATE THERE!!!!

