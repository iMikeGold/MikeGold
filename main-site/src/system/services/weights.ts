import type { Hat } from "@/system/registry";

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export function calculateWeight(hat: Pick<Hat, "weight">): number {
  const { base = 0, experience = 0, rarity = 0 } = hat.weight ?? {};
  return clamp01(base * 0.5 + experience * 0.3 + rarity * 0.2);
}
