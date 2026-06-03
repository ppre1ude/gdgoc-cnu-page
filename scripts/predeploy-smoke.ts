import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { chromium, type Browser, type Page } from '@playwright/test';

import {
  getPredeploySmokeOutputDir,
  predeploySmokeRoutes,
  smokeViewports,
  type PredeploySmokeRoute,
  type PredeploySmokeViewport,
} from '../src/domain/predeploy-smoke.ts';

type SmokeRouteResult = {
  errors: string[];
  path: string;
  screenshot: string;
  status: 'passed' | 'failed';
  url: string;
  viewport: string;
};

const HYDRATION_SETTLE_MS = Number(
  process.env.PREDEPLOY_SMOKE_HYDRATION_MS ?? 750,
);
const baseUrl = normalizeBaseUrl(
  process.env.PREDEPLOY_SMOKE_BASE_URL ??
    process.env.BASE_URL ??
    'http://localhost:3000',
);
const outputDir =
  process.env.PREDEPLOY_SMOKE_OUTPUT_DIR ?? getPredeploySmokeOutputDir();

await mkdir(outputDir, { recursive: true });

const browser = await launchChromium();
const results: SmokeRouteResult[] = [];

if (browser) {
  try {
    for (const viewport of smokeViewports) {
      for (const route of predeploySmokeRoutes) {
        const result = await smokeRoute(browser, route, viewport);
        results.push(result);
      }
    }
  } finally {
    await browser.close();
  }

  const report = {
    baseUrl,
    generatedAt: new Date().toISOString(),
    results,
  };

  await writeFile(
    join(outputDir, 'report.json'),
    `${JSON.stringify(report, null, 2)}\n`,
  );

  const failures = results.flatMap((result) => result.errors);

  if (failures.length > 0) {
    console.error(`Predeploy smoke failed with ${failures.length} issue(s).`);
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exitCode = 1;
  } else {
    console.log(`Predeploy smoke passed for ${results.length} route check(s).`);
    console.log(`Report: ${join(outputDir, 'report.json')}`);
  }
} else {
  process.exitCode = 1;
}

async function smokeRoute(
  browser: Browser,
  route: PredeploySmokeRoute,
  viewport: PredeploySmokeViewport,
): Promise<SmokeRouteResult> {
  const page = await browser.newPage({
    viewport: { height: viewport.height, width: viewport.width },
  });
  const errors: string[] = [];
  const url = new URL(route.path, baseUrl).toString();
  const screenshot = join(outputDir, getViewportScreenshotName(route, viewport));

  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(
        `${route.path} (${viewport.name}): console error: ${message.text()}`,
      );
    }
  });
  page.on('pageerror', (error) => {
    errors.push(`${route.path} (${viewport.name}): page error: ${error.message}`);
  });

  try {
    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
    });

    if (!response) {
      errors.push(
        `${route.path} (${viewport.name}): did not receive a navigation response`,
      );
    } else if (!response.ok()) {
      errors.push(
        `${route.path} (${viewport.name}): returned HTTP ${response.status()}`,
      );
    }

    await page.waitForTimeout(HYDRATION_SETTLE_MS);
    await assertExpectedMainText(page, route, viewport, errors);
    await assertPageHasHeading(page, route, viewport, errors);
    await assertHeaderDoesNotOverflow(page, route, viewport, errors);
    await assertPretendardFont(page, route, viewport, errors);

    if (route.memberBranch) {
      await assertMemberBranchNavigation(page, route, viewport, errors);
    }
  } catch (error) {
    errors.push(
      `${route.path} (${viewport.name}): ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  } finally {
    await page.screenshot({ fullPage: true, path: screenshot });
    await page.close();
  }

  return {
    errors,
    path: route.path,
    screenshot,
    status: errors.length > 0 ? 'failed' : 'passed',
    url,
    viewport: viewport.name,
  };
}

async function assertExpectedMainText(
  page: Page,
  route: PredeploySmokeRoute,
  viewport: PredeploySmokeViewport,
  errors: string[],
) {
  const main = page.locator('main');
  const locator = main
    .getByText(route.expectedMainText, { exact: false })
    .first();

  try {
    await locator.waitFor({ timeout: 5000 });
  } catch {
    errors.push(
      `${route.path} (${viewport.name}): missing expected main text "${route.expectedMainText}"`,
    );
  }
}

async function assertPageHasHeading(
  page: Page,
  route: PredeploySmokeRoute,
  viewport: PredeploySmokeViewport,
  errors: string[],
) {
  const main = page.locator('main');
  const heading = main.getByRole('heading').first();

  if ((await heading.count()) === 0) {
    errors.push(`${route.path} (${viewport.name}): missing page heading`);
    return;
  }

  const headingText = (await heading.innerText()).trim();

  if (headingText.length === 0) {
    errors.push(`${route.path} (${viewport.name}): page heading is empty`);
  }
}

async function assertHeaderDoesNotOverflow(
  page: Page,
  route: PredeploySmokeRoute,
  viewport: PredeploySmokeViewport,
  errors: string[],
) {
  const hasOverflow = await page.evaluate(() => {
    const header =
      document.querySelector('[data-role="top-navigation-wrapper"]') ??
      document.querySelector('header') ??
      document.querySelector('nav');

    if (!header) {
      return false;
    }

    const rect = header.getBoundingClientRect();
    return (
      header.scrollWidth > header.clientWidth + 2 ||
      rect.left < -2 ||
      rect.right > window.innerWidth + 2
    );
  });

  if (hasOverflow) {
    errors.push(`${route.path} (${viewport.name}): header overflows the viewport`);
  }
}

async function assertPretendardFont(
  page: Page,
  route: PredeploySmokeRoute,
  viewport: PredeploySmokeViewport,
  errors: string[],
) {
  const fontFamily = await page.evaluate(
    () => window.getComputedStyle(document.body).fontFamily,
  );

  if (!fontFamily.includes('Pretendard')) {
    errors.push(
      `${route.path} (${viewport.name}): body font stack does not include Pretendard`,
    );
  }
}

async function assertMemberBranchNavigation(
  page: Page,
  route: PredeploySmokeRoute,
  viewport: PredeploySmokeViewport,
  errors: string[],
) {
  const branchNav = page.getByRole('navigation', {
    name: 'Member dashboard branches',
  });

  try {
    await branchNav.waitFor({ timeout: 5000 });
  } catch {
    errors.push(`${route.path} (${viewport.name}): missing member branch navigation`);
    return;
  }

  for (const label of ['Calendar', 'Notices', 'Studies', 'Projects', 'Records']) {
    if ((await branchNav.getByRole('link', { name: label }).count()) === 0) {
      errors.push(
        `${route.path} (${viewport.name}): missing member branch link "${label}"`,
      );
    }
  }

  const currentBranchCount = await branchNav
    .locator('[aria-current="page"]')
    .count();

  if (currentBranchCount !== 1) {
    errors.push(
      `${route.path} (${viewport.name}): expected one active member branch, found ${currentBranchCount}`,
    );
    return;
  }

  const activeBranch = branchNav.locator('[aria-current="page"]').first();
  const activeBranchHref = await activeBranch.getAttribute('href');
  const activeBranchPath = activeBranchHref
    ? new URL(activeBranchHref, baseUrl).pathname
    : null;

  if (activeBranchPath !== route.path) {
    errors.push(
      `${route.path} (${viewport.name}): active member branch points to ${activeBranchPath ?? 'no href'}`,
    );
  }
}

async function launchChromium() {
  try {
    return await chromium.launch();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    console.error('Unable to launch Playwright Chromium.');
    console.error(
      'Install the browser runtime with `npx playwright install chromium` or `npm run smoke:predeploy:install` before running `npm run smoke:predeploy`.',
    );
    console.error(message);
    return null;
  }
}

function getViewportScreenshotName(
  route: PredeploySmokeRoute,
  viewport: PredeploySmokeViewport,
) {
  return route.screenshotName.replace(/\.png$/, `-${viewport.name}.png`);
}

function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, '');
}
