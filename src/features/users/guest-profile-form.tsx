'use client';

import type { FormEvent } from 'react';

import type { ChapterUser } from '@/domain/chapter-user';
import {
  WdsBadge,
  WdsButton,
  WdsField,
  WdsInput,
  WdsTextArea,
} from '@/components/wds-form-controls';
import {
  WdsFormActions,
  WdsResponsiveGrid,
  WdsSurfaceCard,
} from '@/components/wds-layout-primitives';

export type GuestProfileFormState = {
  displayName: string;
  email: string;
  department: string;
  cohort: string;
  studentId: string;
  interests: string;
  motivation: string;
};

export const defaultGuestProfile: GuestProfileFormState = {
  displayName: 'Build with AI Guest',
  email: 'guest.demo@example.com',
  department: '',
  cohort: '',
  studentId: '',
  interests: '',
  motivation: '',
};

const guestProfileFormSurfaceSx = {
  display: 'grid',
  gap: '18px',
  '& h2': {
    color: 'var(--text-strong)',
    fontSize: '22px',
    letterSpacing: 0,
    lineHeight: 1.3,
    margin: '12px 0 8px',
  },
  '& > div > p': {
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    margin: 0,
  },
};

export function GuestProfileForm({
  message,
  onChange,
  onSubmit,
  value,
}: {
  message: string;
  onChange: (value: GuestProfileFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  value: GuestProfileFormState;
}) {
  function updateField(
    field: keyof GuestProfileFormState,
    nextValue: string,
  ) {
    onChange({
      ...value,
      [field]: nextValue,
    });
  }

  return (
    <WdsSurfaceCard
      as="form"
      onSubmit={onSubmit}
      sx={guestProfileFormSurfaceSx}
    >
      <div>
        <WdsBadge tone="green">Guest Profile</WdsBadge>
        <h2>멤버 승인 요청 정보</h2>
        <p>
          운영진이 guest 계정을 member로 승인하기 전에 확인할 기본 정보를
          제출합니다.
        </p>
      </div>

      <WdsResponsiveGrid columns={2}>
        <WdsField label="이름">
          <WdsInput
            onChange={(event) => updateField('displayName', event.target.value)}
            required
            value={value.displayName}
          />
        </WdsField>
        <WdsField label="이메일">
          <WdsInput
            onChange={(event) => updateField('email', event.target.value)}
            required
            type="email"
            value={value.email}
          />
        </WdsField>
        <WdsField label="학과">
          <WdsInput
            onChange={(event) => updateField('department', event.target.value)}
            placeholder="예: 컴퓨터융합학부"
            value={value.department}
          />
        </WdsField>
        <WdsField label="기수 또는 학년">
          <WdsInput
            onChange={(event) => updateField('cohort', event.target.value)}
            placeholder="예: 3기, 2학년"
            value={value.cohort}
          />
        </WdsField>
        <WdsField label="학번">
          <WdsInput
            onChange={(event) => updateField('studentId', event.target.value)}
            value={value.studentId}
          />
        </WdsField>
        <WdsField label="관심 분야">
          <WdsInput
            onChange={(event) => updateField('interests', event.target.value)}
            placeholder="예: Firebase, Gemini, 프론트엔드"
            value={value.interests}
          />
        </WdsField>
      </WdsResponsiveGrid>

      <WdsField label="참여 동기">
        <WdsTextArea
          onChange={(event) => updateField('motivation', event.target.value)}
          placeholder="GDGoC CNU에서 하고 싶은 활동을 적어주세요."
          value={value.motivation}
        />
      </WdsField>

      <WdsFormActions
        actions={
          <WdsButton tone="primary" type="submit">
            승인 요청 정보 저장
          </WdsButton>
        }
        helper={message}
      />
    </WdsSurfaceCard>
  );
}

export function toGuestProfileForm(user: ChapterUser): GuestProfileFormState {
  return {
    cohort: user.cohort ?? '',
    department: user.department ?? '',
    displayName: user.displayName,
    email: user.email,
    interests: user.interests ?? '',
    motivation: user.motivation ?? '',
    studentId: user.studentId ?? '',
  };
}
