import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import {
  findWdsSelectLabel,
  getWdsBadgePresentation,
  getWdsButtonPresentation,
  getWdsTextButtonPresentation,
  normalizeWdsSelectChangeValue,
  type WdsSelectOption,
} from './wds-form-control-model.ts';

describe('WDS form control model', () => {
  it('maps app button tones to WDS button presentation props', () => {
    assert.deepEqual(getWdsButtonPresentation('primary'), {
      color: 'primary',
      variant: 'solid',
    });
    assert.deepEqual(getWdsButtonPresentation('secondary'), {
      color: 'assistive',
      variant: 'outlined',
    });
    assert.deepEqual(getWdsButtonPresentation('ghost'), {
      color: 'assistive',
      variant: 'outlined',
    });
  });

  it('maps low-priority link tones to WDS text button colors', () => {
    assert.deepEqual(getWdsTextButtonPresentation('primary'), {
      color: 'primary',
    });
    assert.deepEqual(getWdsTextButtonPresentation('secondary'), {
      color: 'assistive',
    });
    assert.deepEqual(getWdsTextButtonPresentation('ghost'), {
      color: 'assistive',
    });
  });

  it('maps app badge tones to WDS content badge presentation props', () => {
    assert.deepEqual(getWdsBadgePresentation('neutral'), {
      color: 'neutral',
      neutralColor: 'semantic.label.alternative',
      variant: 'outlined',
    });
    assert.deepEqual(getWdsBadgePresentation('blue'), {
      accentColor: 'semantic.accent.foreground.blue',
      color: 'accent',
      variant: 'outlined',
    });
    assert.deepEqual(getWdsBadgePresentation('green'), {
      accentColor: 'semantic.accent.foreground.green',
      color: 'accent',
      variant: 'outlined',
    });
  });

  it('finds the selected option label from typed select options', () => {
    const options: WdsSelectOption<'public' | 'member'>[] = [
      { label: 'Public', value: 'public' },
      { label: 'Member', value: 'member' },
    ];

    assert.equal(findWdsSelectLabel(options, 'member'), 'Member');
    assert.equal(findWdsSelectLabel(options, 'operator'), undefined);
  });

  it('ignores nullable WDS select change payloads', () => {
    assert.equal(normalizeWdsSelectChangeValue('member'), 'member');
    assert.equal(normalizeWdsSelectChangeValue(null), undefined);
    assert.equal(normalizeWdsSelectChangeValue(undefined), undefined);
  });

  it('keeps notice admin pinned control on the WDS checkbox wrapper', () => {
    const source = readFileSync(
      new URL('../features/notices/notice-admin.tsx', import.meta.url),
      'utf8',
    );

    assert.equal(source.includes('checkbox-field'), false);
    assert.equal(source.includes('<input'), false);
    assert.equal(source.includes('<WdsCheckbox'), true);
  });

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
});
