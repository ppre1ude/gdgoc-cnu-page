export type DemoSeedDocument = {
  id: string;
};

export type DemoSeedResult = {
  collection: string;
  createdIds: string[];
  skippedIds: string[];
  totalSeedCount: number;
};

export type SeedMissingDocumentsInput<TDocument extends DemoSeedDocument> = {
  collection: string;
  seeds: TDocument[];
  listExisting: () => Promise<TDocument[]>;
  writeSeed: (seed: TDocument) => Promise<TDocument>;
};

export async function seedMissingDocuments<TDocument extends DemoSeedDocument>(
  input: SeedMissingDocumentsInput<TDocument>,
): Promise<DemoSeedResult> {
  const seedsById = new Map(input.seeds.map((seed) => [seed.id, seed]));
  const uniqueSeeds = [...seedsById.values()];
  const existing = await input.listExisting();
  const existingIds = new Set(existing.map((document) => document.id));
  const createdIds: string[] = [];
  const skippedIds: string[] = [];

  for (const seed of uniqueSeeds) {
    if (existingIds.has(seed.id)) {
      skippedIds.push(seed.id);
      continue;
    }

    await input.writeSeed(seed);
    createdIds.push(seed.id);
  }

  return {
    collection: input.collection,
    createdIds,
    skippedIds,
    totalSeedCount: uniqueSeeds.length,
  };
}
