import type { ReactNode } from 'react';

export type WdsButtonTone = 'primary' | 'secondary' | 'ghost';

export type WdsButtonPresentation = {
  color: 'primary' | 'assistive';
  variant: 'solid' | 'outlined';
};

export type WdsTextButtonPresentation = {
  color: 'primary' | 'assistive';
};

export type WdsBadgeTone = 'neutral' | 'blue' | 'green' | 'caution' | 'negative';

export type WdsBadgePresentation = {
  accentColor?:
    | 'semantic.accent.foreground.blue'
    | 'semantic.accent.foreground.green'
    | 'semantic.accent.foreground.orange'
    | 'semantic.status.negative';
  color: 'neutral' | 'accent';
  neutralColor?: 'semantic.label.alternative';
  variant: 'outlined';
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

const badgePresentationByTone = {
  neutral: {
    color: 'neutral',
    neutralColor: 'semantic.label.alternative',
    variant: 'outlined',
  },
  blue: {
    accentColor: 'semantic.accent.foreground.blue',
    color: 'accent',
    variant: 'outlined',
  },
  green: {
    accentColor: 'semantic.accent.foreground.green',
    color: 'accent',
    variant: 'outlined',
  },
  caution: {
    accentColor: 'semantic.accent.foreground.orange',
    color: 'accent',
    variant: 'outlined',
  },
  negative: {
    accentColor: 'semantic.status.negative',
    color: 'accent',
    variant: 'outlined',
  },
} as const satisfies Record<WdsBadgeTone, WdsBadgePresentation>;

export function getWdsButtonPresentation(tone: WdsButtonTone) {
  return buttonPresentationByTone[tone];
}

export function getWdsTextButtonPresentation(tone: WdsButtonTone) {
  return textButtonPresentationByTone[tone];
}

export function getWdsBadgePresentation(tone: WdsBadgeTone) {
  return badgePresentationByTone[tone];
}

export function findWdsSelectLabel<Value extends string>(
  options: readonly WdsSelectOption<Value>[],
  value: string,
) {
  return options.find((option) => option.value === value)?.label;
}
