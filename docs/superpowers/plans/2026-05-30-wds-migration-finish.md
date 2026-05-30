# WDS Migration Finish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the remaining common-control WDS migration by replacing the last native admin checkbox, aligning admin authoring cards/forms with shared WDS primitives, moving shared navigation to WDS primitives, and making Pretendard the app font stack.

**Architecture:** Keep the project's local WDS wrapper layer as the boundary between app code and `@wanteddev/wds`. Add a small `WdsCheckbox` wrapper next to `WdsInput`, `WdsSelect`, and `WdsTextArea`, then reuse `WdsSurfaceCard as="form"` for operator authoring forms so cards and forms are not split into separate custom structures.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Wanted Montage WDS, Node test runner.

---

### Task 1: Add WDS Checkbox Wrapper

**Files:**
- Modify: `src/components/wds-form-controls.tsx`
- Modify: `src/components/wds-form-control-model.test.ts`
- Modify: `src/features/notices/notice-admin.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Write the failing test**

Add a behavior guard to `src/components/wds-form-control-model.test.ts` that reads `notice-admin.tsx` and verifies the legacy native checkbox styling is gone:

```ts
it('keeps notice admin pinned control on the WDS checkbox wrapper', () => {
  const source = readFileSync(
    new URL('../features/notices/notice-admin.tsx', import.meta.url),
    'utf8',
  );

  assert.equal(source.includes('checkbox-field'), false);
  assert.equal(source.includes('<input'), false);
  assert.equal(source.includes('<WdsCheckbox'), true);
});
```

The test file must import `readFileSync` from `node:fs`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/components/wds-form-control-model.test.ts`

Expected: FAIL because `notice-admin.tsx` still contains `checkbox-field` and `<input>`.

- [ ] **Step 3: Write minimal implementation**

Update `src/components/wds-form-controls.tsx`:

```tsx
import {
  Button,
  Checkbox,
  ContentBadge,
  ...
} from '@wanteddev/wds';
```

Add:

```tsx
type WdsCheckboxProps = ComponentProps<typeof Checkbox>;

export function WdsCheckbox({
  size = 'medium',
  ...props
}: WdsCheckboxProps) {
  return <Checkbox size={size} {...props} />;
}
```

Update `src/features/notices/notice-admin.tsx` imports and replace the native label/input block with:

```tsx
<WdsField label="상단 고정">
  <WdsCheckbox
    checked={draft.pinned}
    onCheckedChange={(pinned) =>
      setDraft((current) => ({ ...current, pinned }))
    }
  />
</WdsField>
```

Remove `.checkbox-field` CSS from `src/app/globals.css`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/components/wds-form-control-model.test.ts`

Expected: PASS.

### Task 2: Align Admin Authoring Forms With WDS Surface Forms

**Files:**
- Modify: `src/components/wds-layout-primitives.tsx`
- Modify: `src/components/wds-form-control-model.test.ts`
- Modify: `src/features/activities/activity-admin.tsx`
- Modify: `src/features/notices/notice-admin.tsx`
- Modify: `src/features/records/record-admin.tsx`
- Modify: `src/features/showcases/showcase-admin.tsx`

- [ ] **Step 1: Write the failing test**

Add a source-level migration guard to `src/components/wds-form-control-model.test.ts`:

```ts
it('keeps operator authoring forms on WDS surface cards', () => {
  const adminFiles = [
    new URL('../features/activities/activity-admin.tsx', import.meta.url),
    new URL('../features/notices/notice-admin.tsx', import.meta.url),
    new URL('../features/records/record-admin.tsx', import.meta.url),
    new URL('../features/showcases/showcase-admin.tsx', import.meta.url),
  ];

  for (const fileUrl of adminFiles) {
    const source = readFileSync(fileUrl, 'utf8');

    assert.equal(
      source.includes('<form className="form"'),
      false,
      `legacy nested form remains in ${fileUrl.pathname}`,
    );
    assert.equal(
      source.includes('<WdsSurfaceCard as="form"'),
      true,
      `WDS surface form missing in ${fileUrl.pathname}`,
    );
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/components/wds-form-control-model.test.ts`

Expected: FAIL because admin pages still render `<form className="form">` inside `WdsSurfaceCard`.

- [ ] **Step 3: Write minimal implementation**

Update `WdsSurfaceCardProps` in `src/components/wds-layout-primitives.tsx` so it accepts the usual form attributes needed by authoring forms:

```ts
type WdsSurfaceCardProps = Omit<ComponentProps<typeof Card>, 'onSubmit'> & {
  as?: ElementType;
  className?: string;
  href?: string;
  onSubmit?: ComponentProps<'form'>['onSubmit'];
};
```

The type already supports `onSubmit`; keep it and route form props through `PolymorphicCard`.

In each admin file, replace:

```tsx
<WdsSurfaceCard as="section">
  <form className="form" onSubmit={...}>
    ...
  </form>
</WdsSurfaceCard>
```

with:

```tsx
<WdsSurfaceCard as="form" className="form" onSubmit={...}>
  ...
</WdsSurfaceCard>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/components/wds-form-control-model.test.ts`

Expected: PASS.

### Task 3: Verify Migration

**Files:**
- No planned source edits unless verification reveals a defect.

- [ ] **Step 1: Run targeted tests**

Run: `npm run test -- src/components/wds-form-control-model.test.ts`

Expected: PASS.

- [ ] **Step 2: Run full checks**

Run:

```bash
npm run test
npm run typecheck
npm run build
```

Expected: all pass.

- [ ] **Step 3: Inspect residual raw controls**

Run:

```bash
rg -n '<(button|input|select|textarea|label|form)\b|role="button"' src
```

Expected: no ordinary admin controls remain as native `input/select/textarea/button`; any remaining raw `button` should be limited to the custom interactive onboarding doodle where WDS button styling would break the visual asset.

### Execution Addendum

- [x] Migrated the top app navigation to WDS `TopNavigation` / `TopNavigationButton` with primary links in the toolbar slot to avoid narrow-width overlap.
- [x] Migrated member branch navigation to semantic `nav` links styled with WDS `TopNavigationButton`.
- [x] Promoted Pretendard to the explicit `--font-sans` design-system stack and kept the WDS/Pretendard CDN imports guarded by tests.
- [x] Verified the header, member branch navigation, and access-gated admin page in the browser at the available narrow viewport.
