import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';

import {
  createDeploymentEnvironmentReport,
  parseEnvText,
} from './deployment-environment.ts';

describe('deployment environment readiness', () => {
  it('passes when Firebase, Gemini, and deployment origin values are present', () => {
    const report = createDeploymentEnvironmentReport({
      env: {
        NEXT_PUBLIC_FIREBASE_API_KEY: 'public-api-key',
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'gdgoc-cnu.firebaseapp.com',
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'gdgoc-cnu',
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'gdgoc-cnu.appspot.com',
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '12345',
        NEXT_PUBLIC_FIREBASE_APP_ID: '1:12345:web:abc',
        FIREBASE_SERVICE_ACCOUNT_JSON: JSON.stringify({
          client_email: 'firebase-adminsdk@gdgoc-cnu.iam.gserviceaccount.com',
          private_key: '-----BEGIN PRIVATE KEY-----\\nkey\\n-----END PRIVATE KEY-----\\n',
          project_id: 'gdgoc-cnu',
        }),
        GEMINI_API_KEY: 'server-only-gemini-key',
        GEMINI_MODEL: 'gemini-2.0-flash',
        DEPLOYMENT_ORIGIN: 'https://preview.gdgoc-cnu.dev',
      },
    });

    assert.equal(report.ready, true);
    assert.deepEqual(report.failures, []);
  });

  it('reports missing required environment values without exposing secrets', () => {
    const report = createDeploymentEnvironmentReport({
      env: {
        NEXT_PUBLIC_FIREBASE_API_KEY: 'public-api-key',
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'gdgoc-cnu',
      },
    });

    assert.equal(report.ready, false);
    assert.match(
      report.failures.join('\n'),
      /NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN/,
    );
    assert.match(report.failures.join('\n'), /Firebase Admin credential/);
    assert.match(report.failures.join('\n'), /GEMINI_API_KEY/);
    assert.doesNotMatch(report.failures.join('\n'), /public-api-key/);
  });

  it('fails when Gemini secrets are exposed through public environment keys', () => {
    const report = createDeploymentEnvironmentReport({
      env: {
        NEXT_PUBLIC_FIREBASE_API_KEY: 'public-api-key',
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'gdgoc-cnu.firebaseapp.com',
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'gdgoc-cnu',
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'gdgoc-cnu.appspot.com',
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '12345',
        NEXT_PUBLIC_FIREBASE_APP_ID: '1:12345:web:abc',
        FIREBASE_PROJECT_ID: 'gdgoc-cnu',
        FIREBASE_CLIENT_EMAIL: 'firebase-adminsdk@gdgoc-cnu.iam.gserviceaccount.com',
        FIREBASE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\\nkey\\n-----END PRIVATE KEY-----\\n',
        GEMINI_API_KEY: 'server-only-gemini-key',
        NEXT_PUBLIC_GEMINI_API_KEY: 'leaked',
        DEPLOYMENT_ORIGIN: 'https://preview.gdgoc-cnu.dev',
      },
    });

    assert.equal(report.ready, false);
    assert.match(report.failures.join('\n'), /NEXT_PUBLIC_GEMINI_API_KEY/);
    assert.doesNotMatch(report.failures.join('\n'), /server-only-gemini-key/);
  });

  it('fails when the deployment origin is not a public HTTPS origin', () => {
    const baseEnv = {
      NEXT_PUBLIC_FIREBASE_API_KEY: 'public-api-key',
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'gdgoc-cnu.firebaseapp.com',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'gdgoc-cnu',
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'gdgoc-cnu.appspot.com',
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '12345',
      NEXT_PUBLIC_FIREBASE_APP_ID: '1:12345:web:abc',
      FIREBASE_PROJECT_ID: 'gdgoc-cnu',
      FIREBASE_CLIENT_EMAIL: 'firebase-adminsdk@gdgoc-cnu.iam.gserviceaccount.com',
      FIREBASE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\\nkey\\n-----END PRIVATE KEY-----\\n',
      GEMINI_API_KEY: 'server-only-gemini-key',
    };

    for (const deploymentOrigin of [
      'not-a-url',
      'http://preview.gdgoc-cnu.dev',
      'https://localhost:3000',
    ]) {
      const report = createDeploymentEnvironmentReport({
        env: {
          ...baseEnv,
          DEPLOYMENT_ORIGIN: deploymentOrigin,
        },
      });

      assert.equal(report.ready, false);
      assert.match(report.failures.join('\n'), /DEPLOYMENT_ORIGIN/);
    }
  });

  it('rejects malformed env lines instead of inventing keys', () => {
    assert.throws(
      () => parseEnvText('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
      /Malformed env line/,
    );
  });

  it('parses env files with comments and quoted values', () => {
    const env = parseEnvText(`
      # Firebase web config
      NEXT_PUBLIC_FIREBASE_PROJECT_ID=gdgoc-cnu
      FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nkey\\n-----END PRIVATE KEY-----\\n"
      GEMINI_MODEL='gemini-2.0-flash'
    `);

    assert.equal(env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, 'gdgoc-cnu');
    assert.equal(
      env.FIREBASE_PRIVATE_KEY,
      '-----BEGIN PRIVATE KEY-----\\nkey\\n-----END PRIVATE KEY-----\\n',
    );
    assert.equal(env.GEMINI_MODEL, 'gemini-2.0-flash');
  });

  it('documents a deployment env check command for release readiness', async () => {
    const packageJson = JSON.parse(
      await readFile(new URL('../../package.json', import.meta.url), 'utf8'),
    ) as { scripts: Record<string, string> };
    const script = await readFile(
      new URL('../../scripts/deployment-env-check.ts', import.meta.url),
      'utf8',
    );

    assert.equal(
      packageJson.scripts['check:deployment-env'],
      'node --experimental-strip-types scripts/deployment-env-check.ts',
    );
    assert.match(script, /createDeploymentEnvironmentReport/);
    assert.match(script, /DEPLOYMENT_ORIGIN/);
  });
});
