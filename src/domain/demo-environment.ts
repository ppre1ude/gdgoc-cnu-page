export type DemoEnvironmentAuthStatus =
  | 'loading'
  | 'signed_out'
  | 'signed_in';

export type DemoEnvironmentItemStatus =
  | 'ready'
  | 'fallback_ready'
  | 'action_needed';

export type DemoEnvironmentItem = {
  description: string;
  id: 'firebase' | 'auth' | 'gemini';
  label: string;
  status: DemoEnvironmentItemStatus;
};

export type DemoEnvironmentOverallStatus =
  | 'live_ready'
  | 'needs_attention';

export type DemoEnvironmentReadiness = {
  items: DemoEnvironmentItem[];
  overallStatus: DemoEnvironmentOverallStatus;
  requiredActions: string[];
};

export type DemoEnvironmentReadinessInput = {
  authStatus: DemoEnvironmentAuthStatus;
  firebaseConfigured: boolean;
  geminiConfigured: boolean;
};

export function createDemoEnvironmentReadiness(
  input: DemoEnvironmentReadinessInput,
): DemoEnvironmentReadiness {
  const items: DemoEnvironmentItem[] = [
    getFirebaseItem(input.firebaseConfigured),
    getAuthItem(input.authStatus, input.firebaseConfigured),
    getGeminiItem(input.geminiConfigured),
  ];
  const requiredActions = getRequiredActions(input);

  return {
    items,
    overallStatus: getOverallStatus(items),
    requiredActions,
  };
}

function getFirebaseItem(firebaseConfigured: boolean): DemoEnvironmentItem {
  if (!firebaseConfigured) {
    return {
      description: '현재는 localStorage demo bridge로 CRUD 흐름을 검증합니다.',
      id: 'firebase',
      label: 'Firebase',
      status: 'action_needed',
    };
  }

  return {
    description: 'Firebase Web app config가 감지되어 Auth/Firestore 연결을 사용할 수 있습니다.',
    id: 'firebase',
    label: 'Firebase',
    status: 'ready',
  };
}

function getAuthItem(
  authStatus: DemoEnvironmentAuthStatus,
  firebaseConfigured: boolean,
): DemoEnvironmentItem {
  if (!firebaseConfigured) {
    return {
      description: 'Firebase Auth 설정이 필요합니다. demo role 우회는 배포 시연에서 사용하지 않습니다.',
      id: 'auth',
      label: 'Auth',
      status: 'action_needed',
    };
  }

  if (authStatus === 'signed_in') {
    return {
      description: 'Google 로그인 세션과 Firestore role 문서를 사용 중입니다.',
      id: 'auth',
      label: 'Auth',
      status: 'ready',
    };
  }

  return {
    description: 'Firebase는 설정됐지만 Google 로그인 세션이 아직 없습니다.',
    id: 'auth',
    label: 'Auth',
    status: 'action_needed',
  };
}

function getGeminiItem(geminiConfigured: boolean): DemoEnvironmentItem {
  if (!geminiConfigured) {
    return {
      description: 'Gemini API key가 없으면 서버가 local fallback 제안을 반환합니다.',
      id: 'gemini',
      label: 'Gemini',
      status: 'fallback_ready',
    };
  }

  return {
    description: 'Gemini API key가 서버 환경에 설정되어 AI 작성 보조가 실제 API를 호출합니다.',
    id: 'gemini',
    label: 'Gemini',
    status: 'ready',
  };
}

function getRequiredActions(input: DemoEnvironmentReadinessInput) {
  const actions: string[] = [];

  if (!input.firebaseConfigured) {
    actions.push(
      'Firebase Web app config를 .env.local에 추가하면 Firestore/Auth 실제 연결로 전환됩니다.',
    );
  } else if (input.authStatus !== 'signed_in') {
    actions.push(
      'Firebase Auth Google 로그인을 완료해야 실제 사용자/역할 흐름을 검증할 수 있습니다.',
    );
  }

  if (!input.geminiConfigured) {
    actions.push(
      'GEMINI_API_KEY를 추가하면 AI 작성 보조가 local fallback 대신 Gemini를 호출합니다.',
    );
  }

  return actions;
}

function getOverallStatus(
  items: DemoEnvironmentItem[],
): DemoEnvironmentOverallStatus {
  if (items.every((item) => item.status === 'ready')) {
    return 'live_ready';
  }

  return 'needs_attention';
}
