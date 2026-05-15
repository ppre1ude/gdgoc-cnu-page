import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  listProductionFirestoreDocuments,
  resolveBrowserDataAdapterMode,
} from './data-adapter-split.ts';

describe('data adapter split', () => {
  it('uses seeded memory only outside the browser runtime', () => {
    assert.equal(
      resolveBrowserDataAdapterMode({
        firebaseConfigured: true,
        hasBrowserRuntime: false,
      }),
      'server_demo_memory',
    );
  });

  it('uses production Firestore only when the browser has Firebase config', () => {
    assert.equal(
      resolveBrowserDataAdapterMode({
        firebaseConfigured: true,
        hasBrowserRuntime: true,
      }),
      'production_firestore',
    );
    assert.equal(
      resolveBrowserDataAdapterMode({
        firebaseConfigured: false,
        hasBrowserRuntime: true,
      }),
      'local_demo_bridge',
    );
  });

  it('does not substitute demo seeds for an empty production Firestore snapshot', () => {
    const documents = listProductionFirestoreDocuments<string>({
      docs: [],
    });

    assert.deepEqual(documents, []);
  });

  it('maps production Firestore documents through the caller parser', () => {
    const documents = listProductionFirestoreDocuments(
      {
        docs: [
          {
            data: () => ({ id: 'activity-1', title: 'Activity 1' }),
          },
        ],
      },
      (data) => {
        assert.equal(typeof data, 'object');

        return (data as { id: string }).id;
      },
    );

    assert.deepEqual(documents, ['activity-1']);
  });
});
