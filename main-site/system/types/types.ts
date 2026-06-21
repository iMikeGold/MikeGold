export type Hat = {
  id: string;
  name: string;
  category: "creative" | "design" | "engineering" | string;
  description?: string;

  tags?: {
    core?: string[];
    adjacent?: string[];
    meta?: string[];
  };

  weight?: {
    base?: number;
    experience?: number;
    rarity?: number;
  };

  profile?: {
    depth?: number;
    creativity?: number;
    scale?: number;
    interaction?: number;
    structure?: number;
  };
};