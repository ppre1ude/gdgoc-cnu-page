import type { ReactNode } from 'react';

export type WdsButtonTone = 'primary' | 'secondary' | 'ghost';

export type WdsButtonPresentation = {
  color: 'primary' | 'assistive';
  variant: 'solid' | 'outlined';
};

export type WdsTextButtonPresentation = {
  color: 'primary' | 'assistive';
};

export type WdsSelectOption<Value extends string = string> = {
  disabled?: boolean;
  label: ReactNode;
  value: Value;
};

const buttonPresentationByTone = {
  primary: {
    color: 'primary',
    variant: 'solid',
  },
  secondary: {
    color: 'assistive',
    variant: 'outlined',
  },
  ghost: {
    color: 'assistive',
    variant: 'outlined',
  },
} as const satisfies Record<WdsButtonTone, WdsButtonPresentation>;

const textButtonPresentationByTone = {
  primary: {
    color: 'primary',
  },
  secondary: {
    color: 'assistive',
  },
  ghost: {
    color: 'assistive',
  },
} as const satisfies Record<WdsButtonTone, WdsTextButtonPresentation>;

export function getWdsButtonPresentation(tone: WdsButtonTone) {
  return buttonPresentationByTone[tone];
}

export function getWdsTextButtonPresentation(tone: WdsButtonTone) {
  return textButtonPresentationByTone[tone];
}

export function findWdsSelectLabel<Value extends string>(
  options: readonly WdsSelectOption<Value>[],
  value: string,
) {
  return options.find((option) => option.value === value)?.label;
}
