'use client';

import {
  Button,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
  Option,
  OptionContent,
  Select,
  TextArea,
  TextButton,
  TextField,
} from '@wanteddev/wds';
import Link from 'next/link';
import type { ComponentProps, ElementType, ReactNode } from 'react';

import {
  getWdsButtonPresentation,
  getWdsTextButtonPresentation,
  type WdsButtonTone,
  type WdsSelectOption,
} from './wds-form-control-model';

const PolymorphicTextButton = TextButton as unknown as ElementType;

type WdsPolymorphicProps = {
  as?: ElementType;
  href?: ComponentProps<typeof Link>['href'] | string;
  rel?: string;
  target?: string;
};

type WdsButtonProps = Omit<
  ComponentProps<typeof Button>,
  'color' | 'variant'
> &
  WdsPolymorphicProps & {
  tone?: WdsButtonTone;
};

type WdsTextButtonProps = Omit<ComponentProps<typeof TextButton>, 'color'> &
  WdsPolymorphicProps & {
    tone?: WdsButtonTone;
  };

type WdsLinkButtonProps = Omit<WdsButtonProps, 'as' | 'href'> & {
  external?: boolean;
  href: ComponentProps<typeof Link>['href'] | string;
};

type WdsTextLinkButtonProps = Omit<WdsTextButtonProps, 'as' | 'href'> & {
  external?: boolean;
  href: ComponentProps<typeof Link>['href'] | string;
};

type WdsFieldProps = {
  children: ReactNode;
  className?: string;
  label: ReactNode;
  message?: ReactNode;
};

type WdsInputProps = ComponentProps<typeof TextField>;
type WdsTextAreaProps = ComponentProps<typeof TextArea>;

type WdsSelectProps<Value extends string> = Omit<
  ComponentProps<typeof Select>,
  'children' | 'onChange' | 'value'
> & {
  onValueChange: (value: Value) => void;
  options: readonly WdsSelectOption<Value>[];
  value: Value;
};

export function WdsButton({
  size = 'medium',
  tone = 'primary',
  ...props
}: WdsButtonProps) {
  return (
    <Button
      {...getWdsButtonPresentation(tone)}
      size={size}
      {...props}
    />
  );
}

export function WdsLinkButton({
  external = false,
  href,
  rel,
  target,
  ...props
}: WdsLinkButtonProps) {
  if (external) {
    return (
      <WdsButton
        as="a"
        href={String(href)}
        rel={rel ?? 'noreferrer'}
        target={target ?? '_blank'}
        type={undefined}
        {...props}
      />
    );
  }

  return <WdsButton as={Link} href={href} type={undefined} {...props} />;
}

export function WdsTextLinkButton({
  external = false,
  href,
  rel,
  size = 'small',
  target,
  tone = 'ghost',
  ...props
}: WdsTextLinkButtonProps) {
  const presentation = getWdsTextButtonPresentation(tone);

  if (external) {
    return (
      <PolymorphicTextButton
        {...presentation}
        as="a"
        href={String(href)}
        rel={rel ?? 'noreferrer'}
        size={size}
        target={target ?? '_blank'}
        type={undefined}
        {...props}
      />
    );
  }

  return (
    <PolymorphicTextButton
      {...presentation}
      as={Link}
      href={href}
      size={size}
      type={undefined}
      {...props}
    />
  );
}

export function WdsField({
  children,
  className,
  label,
  message,
}: WdsFieldProps) {
  return (
    <FormField className={className}>
      <FormLabel>{label}</FormLabel>
      <FormControl>{children}</FormControl>
      <FormMessage>{message}</FormMessage>
    </FormField>
  );
}

export function WdsInput({
  height = 44,
  width = '100%',
  ...props
}: WdsInputProps) {
  return <TextField height={height} width={width} {...props} />;
}

export function WdsTextArea({
  minRows = 5,
  width = '100%',
  ...props
}: WdsTextAreaProps) {
  return <TextArea minRows={minRows} width={width} {...props} />;
}

export function WdsSelect<Value extends string>({
  onValueChange,
  options,
  placeholder = '선택',
  value,
  width = '100%',
  ...props
}: WdsSelectProps<Value>) {
  return (
    <Select
      onChange={(nextValue) => onValueChange(nextValue as Value)}
      placeholder={placeholder}
      value={value}
      width={width}
      {...props}
    >
      {options.map((option) => (
        <Option
          disabled={option.disabled}
          key={option.value}
          value={option.value}
        >
          <OptionContent>{option.label}</OptionContent>
        </Option>
      ))}
    </Select>
  );
}

export type { WdsSelectOption };
