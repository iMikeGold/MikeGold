import type { UUID } from "@/system/core/ids";
import type { RecordType } from "@/system/core/record-types";

export interface BaseRecord<TId extends UUID, TType extends RecordType> {
  id: TId;
  recordType: TType;
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
}
