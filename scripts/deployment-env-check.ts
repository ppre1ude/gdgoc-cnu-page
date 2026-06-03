import { readFile } from 'node:fs/promises';

import {
  createDeploymentEnvironmentReport,
  parseEnvText,
} from '../src/domain/deployment-environment.ts';

const envFilePath = getEnvFilePath(process.argv.slice(2));
const fileEnv = envFilePath
  ? parseEnvText(await readFile(envFilePath, 'utf8'))
  : {};
const report = createDeploymentEnvironmentReport({
  env: {
    ...process.env,
    ...fileEnv,
  },
});

if (report.ready) {
  console.log('Deployment environment check passed.');
} else {
  console.error('Deployment environment check failed.');
  console.error(
    'Usage: set DEPLOYMENT_ORIGIN and optionally pass --env-file .env.local before release.',
  );
  for (const failure of report.failures) {
    console.error(`- ${failure}`);
  }
}

console.log('\nManual console checks:');
for (const manualCheck of report.manualChecks) {
  console.log(`- ${manualCheck}`);
}

console.log('\nWarnings:');
for (const warning of report.warnings) {
  console.log(`- ${warning}`);
}

if (!report.ready) {
  process.exitCode = 1;
}

function getEnvFilePath(args: string[]) {
  const envFileIndex = args.indexOf('--env-file');

  if (envFileIndex === -1) {
    return undefined;
  }

  const value = args[envFileIndex + 1];

  if (!value) {
    throw new Error('Usage: npm run check:deployment-env -- --env-file .env.local');
  }

  return value;
}
