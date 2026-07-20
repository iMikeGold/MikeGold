import "server-only";

import { internalEvidenceRecords } from "@/system/generated/internal-evidence-records.generated";
import type { EvidenceId } from "@/system/core/ids";

export const getAllInternalEvidence = () => internalEvidenceRecords;
export const getInternalEvidenceById = (id: EvidenceId) =>
  internalEvidenceRecords.find((evidence) => evidence.id === id) ?? null;
