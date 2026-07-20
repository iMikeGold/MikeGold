import "server-only";

import { internalHatRecords } from "@/system/generated/internal-hat-records.generated";
import type { HatId } from "@/system/core/ids";
import type { InternalHatRecord } from "@/system/hats/hat.types";

export function getAllInternalHats(): readonly InternalHatRecord[] {
  return internalHatRecords;
}

export function getInternalHatById(id: HatId): InternalHatRecord | null {
  return internalHatRecords.find((hat) => hat.id === id) ?? null;
}

export function getInternalHatBySlug(slug: string): InternalHatRecord | null {
  return internalHatRecords.find((hat) => hat.slug === slug) ?? null;
}

export function getInternalHatByLegacyKey(
  legacyKey: string,
): InternalHatRecord | null {
  return internalHatRecords.find((hat) => hat.legacyKey === legacyKey) ?? null;
}
