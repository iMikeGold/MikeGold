import type { HatId } from "@/system/core/ids";
import type { BaseRecord } from "@/system/core/record";

export type HatCategory = "creative" | "design" | "engineering";
export type HatRelationshipType =
  | "dependency"
  | "supports"
  | "overlap"
  | "adjacent";

export interface HatWeight {
  base?: number;
  experience?: number;
  rarity?: number;
}

export interface HatTags {
  core: string[];
  adjacent: string[];
  meta?: string[];
}

export interface HatDetails {
  overview?: string;
  capabilities?: string[];
  usedFor?: string[];
}

export interface InternalHatRelationship {
  targetId: HatId;
  type: HatRelationshipType;
  strength: number;
}

export interface InternalHatRecord extends BaseRecord<HatId, "hat"> {
  legacyKey: string;
  slug: string;
  name: string;
  status: "draft" | "defined" | "published";
  category: HatCategory;
  type: string;
  description?: string;
  tags: HatTags;
  weight?: HatWeight;
  relationships?: InternalHatRelationship[];
  details?: HatDetails;
}

export interface PublicHatRelationship {
  targetId: string;
  type: HatRelationshipType;
  strength: number;
}

/**
 * Client-safe Hat shape. `id` remains the historical semantic key during the
 * compatibility migration and never contains the internal record UUID.
 */
export interface PublicHat {
  id: string;
  slug: string;
  name: string;
  category: HatCategory;
  type: string;
  description?: string;
  tags: HatTags;
  weight?: HatWeight;
  relationships?: PublicHatRelationship[];
  details?: HatDetails;
}
