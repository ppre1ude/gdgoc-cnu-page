export type DeploymentEnvironmentReport = {
  ready: boolean;
  failures: string[];
  warnings: string[];
  manualChecks: string[];
};

type DeploymentEnvironmentInput = {
  env: Record<string, string | undefined>;
};

const firebasePublicEnvKeys = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
] as const;

const serverFirebaseEnvKeys = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
] as const;

export function createDeploymentEnvironmentReport({
  env,
}: DeploymentEnvironmentInput): DeploymentEnvironmentReport {
  const failures = [
    ...missingFirebasePublicKeys(env),
    ...missingFirebaseAdminCredential(env),
    ...missingGeminiKeys(env),
    ...publicSecretExposureFailures(env),
    ...missingDeploymentOrigin(env),
  ];

  return {
    ready: failures.length === 0,
    failures,
    warnings: [
      'Firebase Auth authorized domains must be checked in the Firebase console for the deployment origin.',
      'The first operator chapterUsers/{uid} document must be bootstrapped with role "admin" in the target Firestore project.',
      'Gemini API key restrictions must be checked in Google Cloud or Google AI Studio for the deployment target.',
    ],
    manualChecks: [
      'Add the preview or production domain to Firebase Auth authorized domains.',
      'Create or verify the first admin role document before inviting operators.',
      'Run Firestore rules verification immediately before public deployment.',
      'Confirm the deployed Gemini route falls back safely on quota, network, or schema failures.',
    ],
  };
}

export function parseEnvText(text: string): Record<string, string> {
  const entries: Array<[string, string]> = [];

  for (const [index, rawLine] of text.split(/\r?\n/).entries()) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');

    if (separatorIndex <= 0) {
      throw new Error(`Malformed env line ${index + 1}: expected KEY=value.`);
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();

    entries.push([key, stripMatchingQuotes(rawValue)]);
  }

  return Object.fromEntries(entries);
}

function missingFirebasePublicKeys(env: Record<string, string | undefined>) {
  const missingKeys = firebasePublicEnvKeys.filter((key) => !env[key]);

  if (missingKeys.length === 0) {
    return [];
  }

  return [`Missing Firebase public env keys: ${missingKeys.join(', ')}.`];
}

function missingFirebaseAdminCredential(env: Record<string, string | undefined>) {
  if (hasValidServiceAccountJson(env.FIREBASE_SERVICE_ACCOUNT_JSON)) {
    return [];
  }

  const missingKeys = serverFirebaseEnvKeys.filter((key) => !env[key]);

  if (missingKeys.length === 0) {
    return [];
  }

  return [
    `Firebase Admin credential is incomplete. Provide FIREBASE_SERVICE_ACCOUNT_JSON or ${serverFirebaseEnvKeys.join(', ')}.`,
  ];
}

function missingGeminiKeys(env: Record<string, string | undefined>) {
  return env.GEMINI_API_KEY ? [] : ['Missing server-only GEMINI_API_KEY.'];
}

function publicSecretExposureFailures(env: Record<string, string | undefined>) {
  return Object.keys(env)
    .filter((key) => key.startsWith('NEXT_PUBLIC_'))
    .filter((key) => /GEMINI|PRIVATE|SERVICE_ACCOUNT|CLIENT_EMAIL/.test(key))
    .map((key) => `${key} must not be exposed through NEXT_PUBLIC_ env.`);
}

function missingDeploymentOrigin(env: Record<string, string | undefined>) {
  if (!env.DEPLOYMENT_ORIGIN) {
    return ['Missing DEPLOYMENT_ORIGIN for deployment-domain verification.'];
  }

  return isPublicHttpsOrigin(env.DEPLOYMENT_ORIGIN)
    ? []
    : [
        'DEPLOYMENT_ORIGIN must be a public HTTPS origin such as https://preview.example.com.',
      ];
}

function hasValidServiceAccountJson(value: string | undefined) {
  if (!value) {
    return false;
  }

  try {
    const serviceAccount = JSON.parse(value) as {
      clientEmail?: string;
      client_email?: string;
      privateKey?: string;
      private_key?: string;
      projectId?: string;
      project_id?: string;
    };

    return Boolean(
      (serviceAccount.projectId ?? serviceAccount.project_id) &&
        (serviceAccount.clientEmail ?? serviceAccount.client_email) &&
        (serviceAccount.privateKey ?? serviceAccount.private_key),
    );
  } catch {
    return false;
  }
}

function stripMatchingQuotes(value: string) {
  const first = value[0];
  const last = value[value.length - 1];

  if ((first === '"' || first === "'") && first === last) {
    return value.slice(1, -1);
  }

  return value;
}

function isPublicHttpsOrigin(value: string) {
  try {
    const url = new URL(value);
    const hasOnlyOrigin =
      url.pathname === '/' && url.search === '' && url.hash === '';
    const isLocalhost =
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1' ||
      url.hostname === '[::1]';

    return url.protocol === 'https:' && hasOnlyOrigin && !isLocalhost;
  } catch {
    return false;
  }
}
