export type UUID = string & { readonly __brand: "UUID" };

export type HatId = UUID & { readonly __recordType: "HatId" };
export type ProjectId = UUID & { readonly __recordType: "ProjectId" };
export type WorkId = UUID & { readonly __recordType: "WorkId" };
export type EvidenceId = UUID & { readonly __recordType: "EvidenceId" };
export type RelationshipId = UUID & { readonly __recordType: "RelationshipId" };
export type EventId = UUID & { readonly __recordType: "EventId" };
export type DeploymentId = UUID & { readonly __recordType: "DeploymentId" };

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): value is UUID {
  return UUID_PATTERN.test(value);
}
