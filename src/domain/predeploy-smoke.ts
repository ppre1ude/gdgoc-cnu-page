export type PredeploySmokeRoute = {
  expectedMainText: string;
  memberBranch: boolean;
  path: string;
  screenshotName: string;
};

export type PredeploySmokeViewport = {
  height: number;
  name: 'desktop' | 'mobile';
  width: number;
};

export const predeploySmokeRoutes = [
  {
    expectedMainText: 'GDGoC CNU Values',
    memberBranch: false,
    path: '/',
    screenshotName: 'home.png',
  },
  {
    expectedMainText: '다음 일정 확인',
    memberBranch: true,
    path: '/calendar',
    screenshotName: 'calendar.png',
  },
  {
    expectedMainText: '중요 공지 확인',
    memberBranch: true,
    path: '/notices',
    screenshotName: 'notices.png',
  },
  {
    expectedMainText: '스터디 탐색',
    memberBranch: true,
    path: '/studies',
    screenshotName: 'studies.png',
  },
  {
    expectedMainText: '프로젝트 탐색',
    memberBranch: true,
    path: '/projects',
    screenshotName: 'projects.png',
  },
  {
    expectedMainText: '기록 살펴보기',
    memberBranch: true,
    path: '/records',
    screenshotName: 'records.png',
  },
  {
    expectedMainText: 'Access Denied',
    memberBranch: false,
    path: '/admin/notices',
    screenshotName: 'admin-notices.png',
  },
  {
    expectedMainText: 'Google Login',
    memberBranch: false,
    path: '/login',
    screenshotName: 'login.png',
  },
] as const satisfies readonly PredeploySmokeRoute[];

export const smokeViewports = [
  { height: 900, name: 'desktop', width: 1280 },
  { height: 844, name: 'mobile', width: 390 },
] as const satisfies readonly PredeploySmokeViewport[];

export function getPredeploySmokeOutputDir() {
  return '.scratch/run/predeploy-smoke';
}
