export type IsoDate = string & { readonly __brand: "IsoDate" };
export type IsoDateTime = string & { readonly __brand: "IsoDateTime" };

export function isIsoDateTime(value: string): value is IsoDateTime {
  return !Number.isNaN(Date.parse(value));
}
