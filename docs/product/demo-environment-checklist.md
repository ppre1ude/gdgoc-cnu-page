# Demo Bridge -> Real Firebase/Auth/Gemini 전환 체크리스트

## Firebase

- [ ] Firebase Console에서 실제 데모용 프로젝트를 만든다.
- [ ] 프로젝트 안에 Web app을 등록하고 Firebase config 값을 확보한다.
- [ ] Authentication에서 Google provider를 활성화한다.
- [ ] Auth authorized domains에 로컬, 개발, 배포 도메인을 등록한다.
  - 예: `localhost`, Firebase 기본 도메인, Vercel preview/production 도메인, 커스텀 도메인.
- [ ] Firestore Database를 만든다.
- [ ] Firestore rules는 데모 공개 전 반드시 점검한다.
  - 빠른 데모용 임시 규칙을 쓰더라도 공개 배포에는 그대로 쓰지 않는다.
  - 현재 클라이언트 Firebase SDK 흐름에서는 rules가 실제 접근 제어의 마지막 방어선이다.
- [ ] 최초 운영자 계정으로 Google 로그인한 뒤, Firebase Console에서 해당 `uid`의 `chapterUsers/{uid}` 문서를 `admin` role로 한 번 bootstrap한다.
  - 이 단계가 없으면 보안 규칙상 클라이언트에서 운영 콘텐츠 seed를 만들 수 없다.
- [ ] `.env.local` 설정 후 `/admin`의 `Demo Data` 패널에서 `Demo 데이터 채우기`를 눌러 seed 문서를 실제 Firestore에 넣는다.
  - Firebase 설정 전에는 같은 버튼이 localStorage demo bridge만 채운다.
  - Firestore 모드에서는 `activities`, `notices`, `showcases`, 기본 `sessions`를 채운다.
  - `chapterUsers`와 `chapterRecords`는 보안 규칙상 로그인/승인/작성 흐름 또는 수동 bootstrap으로 준비한다.
  - 이 작업은 기존 seed id 문서를 덮어쓰지 않고 누락된 문서만 추가한다.

## `.env.local`

- [ ] `.env.example`을 기준으로 `.env.local`을 만들고 아래 이름 그대로 채운다.

```ini
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash
```

- [ ] `NEXT_PUBLIC_FIREBASE_*` 값은 Firebase Web app config에서 가져온다.
- [ ] `GEMINI_API_KEY`는 브라우저에 노출하지 않는 서버 전용 값으로 둔다.
- [ ] `GEMINI_MODEL`은 필요할 때만 바꾸고, 기본값은 `gemini-2.0-flash`로 둔다.

## Gemini

- [ ] Google AI Studio에서 Gemini API key를 발급한다.
- [ ] API key 제한을 걸 수 있으면 데모/개발 환경에 맞게 제한한다.
- [ ] 키가 없으면 현재 앱은 로컬 fallback으로 응답하므로, 실제 Gemini 호출 확인은 `.env.local` 설정 후 따로 검증한다.

## Wanted Montage WDS

- [ ] Wanted Montage Web packages를 설치하거나 CI에서 복원해야 한다면 GitHub Packages 접근 토큰을 준비한다.
- [ ] 토큰은 `read:packages` 권한을 포함하고, user-level `.npmrc` 또는 CI secret에만 둔다.
- [ ] 프로젝트에 커밋하는 `.npmrc`에는 registry 설정만 두고 토큰은 커밋하지 않는다.
