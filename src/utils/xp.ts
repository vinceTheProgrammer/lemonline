import { container } from "@sapphire/framework";
import { getServerXpSettings } from "./database.js";

export const xpCache: number[] = []; // xpCache[level] = total XP to reach that level
xpCache[1] = 0; // Level 1 starts at 0 XP

const storedFormula = (await getServerXpSettings('1376370662360481812'))?.levelFormula; // TODO?

export const totalXpFormula = (level: number): number => {
  if (!storedFormula) return 100 * (level - 1) * level / 2;
  const fn = new Function("level", `return ${storedFormula};`);
  return fn(level);
}

export const getTotalXp = (level: number): number => {
  if (xpCache[level] != null && xpCache[level] !== undefined) {
    console.log(`${level} in cache, not computing --> ${xpCache[level]}`);
    return xpCache[level];
  }

    console.log("not in cache, computing...");

  for (let i = xpCache.length; i <= level; i++) {
    xpCache[i] = totalXpFormula(i);
  }

  if (xpCache[level] != null && xpCache[level] !== undefined) {
    console.log(`${level} was not in cache, but now is --> ${xpCache[level]}`);
    return xpCache[level];
  }


  console.log("I don't feel so good...");
  return -1;
};

export const getRelativeXp = (totalXp: number, level?: number): number => {
  let currentLevel = level;
  if (!currentLevel) currentLevel = getLevelFromXp(totalXp);
  const xpNeededForCurrentLevel = totalXpFormula(currentLevel);
  return totalXp - xpNeededForCurrentLevel;
}

export const getDeltaXp = (level: number): number =>
  getTotalXp(level + 1) - getTotalXp(level);

export const getLevelFromXp = (xp: number): number => {
  // Extend xpCache until the last known total XP exceeds the input XP
  while (getTotalXp(xpCache.length) <= xp) {
    // Just call getTotalXp to trigger cache extension
    getTotalXp(xpCache.length);
  }

  let low = 1;
  let high = xpCache.length + 1;

  // Try to binary search existing cache
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (getTotalXp(mid) > xp) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }

  return low - 1;
};
