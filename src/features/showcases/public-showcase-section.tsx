'use client';

import { useEffect, useMemo, useState } from 'react';

import { ShowcaseCard } from '@/components/showcase-card';
import { WdsEmptyState } from '@/components/wds-form-controls';
import { WdsSectionHeader } from '@/components/wds-layout-primitives';
import type { Showcase } from '@/domain/showcase';
import { listVisibleShowcases } from '@/domain/showcase';
import { listHomeShowcases } from '@/domain/showcase-service';
import { createBrowserShowcaseStore } from './browser-showcase-store';
import { seedShowcases } from './seed-showcases';

export function PublicShowcaseSection() {
  const store = useMemo(() => createBrowserShowcaseStore(), []);
  const [showcases, setShowcases] = useState<Showcase[]>(
    listVisibleShowcases(seedShowcases, 'visitor'),
  );

  useEffect(() => {
    async function refreshShowcases() {
      setShowcases(await listHomeShowcases(store, 'visitor'));
    }

    void refreshShowcases();
  }, [store]);

  return (
    <section className="section" id="showcase">
      <div className="container">
        <WdsSectionHeader
          description="GDGoC CNU가 Build with AI와 챕터 활동에서 남긴 결과와 기록입니다."
          title="Showcase"
        />
        {showcases.length > 0 ? (
          <div className="grid grid-3">
            {showcases.slice(0, 3).map((showcase) => (
              <ShowcaseCard key={showcase.id} showcase={showcase} />
            ))}
          </div>
        ) : (
          <WdsEmptyState>아직 공개할 쇼케이스가 없습니다.</WdsEmptyState>
        )}
      </div>
    </section>
  );
}
