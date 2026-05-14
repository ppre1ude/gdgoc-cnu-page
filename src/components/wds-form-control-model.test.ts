import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  findWdsSelectLabel,
  getWdsButtonPresentation,
  getWdsTextButtonPresentation,
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

  it('finds the selected option label from typed select options', () => {
    const options: WdsSelectOption<'public' | 'member'>[] = [
      { label: 'Public', value: 'public' },
      { label: 'Member', value: 'member' },
    ];

    assert.equal(findWdsSelectLabel(options, 'member'), 'Member');
    assert.equal(findWdsSelectLabel(options, 'operator'), undefined);
  });
});
