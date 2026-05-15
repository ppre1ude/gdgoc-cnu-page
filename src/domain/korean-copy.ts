export const koreanCopy = {
  activityAdmin: {
    saveErrors: {
      fallback:
        'Activity를 저장하지 못했습니다. 입력값을 확인한 뒤 다시 시도하세요.',
      externalRegistrationRequired:
        '외부 등록 또는 내부 신청 + 외부 등록 방식에는 외부 등록 URL이 필요합니다.',
      invalidStartsAt: 'Activity 일정은 올바른 날짜 / 시간으로 입력해야 합니다.',
      summaryRequired: 'Activity를 저장하려면 운영진 메모 / 본문을 입력해야 합니다.',
      titleRequired: 'Activity를 저장하려면 제목을 입력해야 합니다.',
    },
  },
  memberAccess: {
    activeMember: {
      message: '멤버 홈을 이용할 수 있습니다.',
    },
    alumni: {
      message:
        '수료 멤버는 멤버 콘텐츠를 볼 수 있지만 활동 신청은 할 수 없습니다.',
    },
    guest: {
      message: '운영진 승인 후 멤버 홈을 이용할 수 있습니다.',
    },
    visitor: {
      message: '멤버 홈을 보려면 로그인이 필요합니다.',
    },
  },
  memberHome: {
    access: {
      currentRoleLabel: '현재 역할',
      demoRoleLabel: 'Demo 역할',
      guestSubmitLabel: '가입 정보 제출',
      googleLoginLabel: 'Google 로그인',
    },
    activitySections: {
      challenges: {
        description: '챕터 참여를 높이기 위한 챌린지와 친목 활동입니다.',
        title: '챌린지 / 친목',
      },
      empty: '아직 표시할 활동이 없습니다.',
      studiesAndProjects: {
        description: '장기적으로 이어지는 학습과 제작 활동입니다.',
        title: '스터디 / 프로젝트',
      },
      upcoming: {
        description: '오프라인 이벤트와 일정이 있는 활동을 우선 표시합니다.',
        title: '다가오는 활동',
      },
    },
    applications: {
      description:
        '내가 신청한 활동의 승인 상태와 다음 일정을 별도 목록으로 확인합니다.',
      detailLabel: '자세히',
      empty: '아직 신청 중인 활동이 없습니다.',
      title: '내 신청 현황',
      unscheduled: '일정 미정',
    },
    confirmations: {
      apply:
        '이 활동에 참여 신청하시겠습니까? 운영진 승인 후 참여가 확정됩니다.',
      cancel:
        '정말 취소하시겠습니까? 승인된 신청을 취소하면 다시 신청 시 운영진 승인을 다시 받아야 합니다.',
    },
    guestProfile: {
      initialMessage:
        '승인에 필요한 정보를 제출하면 운영진 승인 큐에서 바로 확인할 수 있습니다.',
      savedMessage:
        '승인 요청 정보가 저장되었습니다. 운영진 승인 화면에서 바로 확인할 수 있습니다.',
    },
    header: {
      description:
        '공지, 이벤트, 스터디, 프로젝트를 한 화면에서 확인하는 멤버용 홈입니다. 현재 데모는 activity 데이터를 Firebase 또는 localStorage bridge에서 읽습니다.',
      eyebrow: 'Member Home',
      title: '지금 우리 챕터에서 진행 중인 활동',
    },
    notices: {
      description: '운영진이 고정한 중요한 공지를 먼저 보여줍니다.',
      title: '공지사항',
    },
    proposal: {
      fieldLabels: {
        startsAt: '일정',
        summary: '요약',
        title: '제목',
        type: '활동 유형',
      },
      initialMessage:
        '스터디는 바로 멤버 홈에 공개되고, 프로젝트는 운영진 검토 후 공개됩니다.',
      intro:
        '멤버가 직접 스터디를 열거나 프로젝트 아이디어를 제안할 수 있습니다. 프로젝트는 운영진 승인 후 멤버 홈에 공개됩니다.',
      projectSavedMessage:
        '프로젝트 제안이 운영진 검토 대기열에 저장되었습니다.',
      studySavedMessage: '스터디 제안이 저장되어 멤버 홈에 바로 반영되었습니다.',
      submitLabel: '제안 제출',
      title: '스터디 / 프로젝트 제안',
    },
    recordForm: {
      fieldLabels: {
        body: '본문',
        kind: '기록 유형',
        summary: '요약',
        tags: '태그',
        title: '제목',
      },
      initialMessage: '회고와 기술 노트는 운영진 검토 후 멤버 홈에 게시됩니다.',
      intro:
        'Discord에 묻히기 쉬운 긴 글을 홈페이지 기록으로 남깁니다. 제출된 글은 운영진 검토 후 멤버 홈에 게시됩니다.',
      savedMessage: '긴 글 기록이 운영진 검토 대기열에 저장되었습니다.',
      submitLabel: '기록 제출',
      title: '회고 / 리뷰 / 기술 노트 작성',
    },
    records: {
      description:
        '회고, 리뷰, 기술 노트처럼 Discord보다 오래 남겨야 하는 글을 모아 보여줍니다.',
      empty: '아직 게시된 긴 글 기록이 없습니다.',
      title: '긴 글 기록',
    },
    showcase: {
      description:
        '최근 활동 성과, 회고, 프로젝트 결과를 activity와 분리된 아카이브로 모아 보여줍니다.',
      empty: '아직 표시할 쇼케이스가 없습니다.',
      title: '쇼케이스',
    },
    statusLabels: {
      access: {
        active_member: '멤버 홈 이용 가능',
        alumni: 'Alumni 보기 모드',
        login_required: '로그인이 필요합니다',
        pending_approval: '운영진 승인 대기 중',
        unknown: '역할 확인 중',
      },
      application: {
        applied: '운영진 승인 대기 중',
        approved: '승인됨',
      },
    },
    summaryCards: {
      nextAction: {
        description:
          'Firebase 설정 전에는 localStorage bridge로 같은 흐름을 검증합니다.',
        title: (activityCount: number) => `${activityCount}개 활동 열람 가능`,
      },
      participation: {
        applyLimitedTitle: '활동 신청 제한',
        applyMessage:
          '참여 신청을 누르면 이 숫자와 카드 상태가 바로 바뀝니다.',
        fallbackMessage: '역할 정보를 확인한 뒤 신청 가능 여부를 표시합니다.',
        title: (activeApplicationCount: number) =>
          `${activeApplicationCount}개 활동 참여 중`,
      },
    },
  },
  navigation: {
    admin: {
      activities: {
        description:
          '활동을 등록하고 Gemini 작성 보조, 신청 승인, 출석 흐름을 확인합니다.',
      },
      notices: {
        description:
          '공지사항을 등록하고 핀 고정, 공개 범위, 멤버 홈 노출을 관리합니다.',
      },
      records: {
        description:
          '회고, 리뷰, 기술 노트처럼 오래 남길 챕터 기록을 검토하고 게시합니다.',
      },
      roles: {
        description: '가입한 사용자의 역할을 조정하고 변경 이력을 확인합니다.',
      },
      showcases: {
        description:
          '성과, 회고, 갤러리, 프로젝트 결과를 등록하고 공개 범위를 관리합니다.',
      },
    },
  },
  roleGate: {
    currentRoleLabel: '현재 역할',
    defaultDescription: '현재 역할로는 이 화면에 접근할 수 없습니다.',
    defaultTitle: '권한이 필요합니다',
    demoAccessNotice:
      '데모 환경에서는 상단의 Demo role 선택으로 권한별 화면을 확인할 수 있습니다.',
    liveAccessNotice:
      '실제 배포 환경에서는 Firebase Auth 로그인과 저장된 사용자 역할을 기준으로 접근을 보호합니다. 권한이 필요하면 운영진에게 역할 승인을 요청하세요.',
    loadingDescription: '로그인 상태와 챕터 역할을 불러오고 있습니다.',
    loadingTitle: '권한 확인 중',
  },
} as const;
