export type BrowserDataAdapterMode =
  | 'local_demo_bridge'
  | 'production_firestore'
  | 'server_demo_memory';

export type ResolveBrowserDataAdapterModeInput = {
  firebaseConfigured: boolean;
  hasBrowserRuntime: boolean;
};

export type ProductionFirestoreSnapshot = {
  docs: Array<{
    data(): unknown;
  }>;
};

export function resolveBrowserDataAdapterMode({
  firebaseConfigured,
  hasBrowserRuntime,
}: ResolveBrowserDataAdapterModeInput): BrowserDataAdapterMode {
  if (!hasBrowserRuntime) {
    return 'server_demo_memory';
  }

  return firebaseConfigured ? 'production_firestore' : 'local_demo_bridge';
}

export function listProductionFirestoreDocuments<TDocument>(
  snapshot: ProductionFirestoreSnapshot,
  parseDocument: (data: unknown) => TDocument = (data) => data as TDocument,
): TDocument[] {
  return snapshot.docs.map((documentSnapshot) =>
    parseDocument(documentSnapshot.data()),
  );
}
