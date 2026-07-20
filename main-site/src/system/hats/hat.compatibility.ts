import "server-only";

import { isUuid, type HatId } from "@/system/core/ids";
import {
  getInternalHatById,
  getInternalHatByLegacyKey,
  getInternalHatBySlug,
} from "@/system/hats/hat.repository";
import type { InternalHatRecord } from "@/system/hats/hat.types";

export function resolveHatReference(reference: string): InternalHatRecord | null {
  if (isUuid(reference)) return getInternalHatById(reference as HatId);
  return (
    getInternalHatBySlug(reference) ?? getInternalHatByLegacyKey(reference)
  );
}
