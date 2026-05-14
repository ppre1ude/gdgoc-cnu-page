# Demo Environment Remaining Checklist

Firebase Web app, Google Auth provider, Firestore, rules deploy, demo data seed, public Activity CRUD loop, Gemini API response, and WDS foundation setup have already been verified. This checklist keeps only the remaining setup items.

## Gemini Residual Checks

- [ ] API key 제한을 걸 수 있으면 데모/개발 환경에 맞게 제한한다.

## Firebase Residual Checks

- [ ] 배포 도메인이 정해지면 Firebase Auth authorized domains에 Vercel production/preview 또는 커스텀 도메인을 추가한다.
- [ ] 공개 배포 직전에 Firestore rules를 다시 점검한다.
- [ ] 최초 운영자 `chapterUsers/{uid}` 문서가 `admin` role로 bootstrap되어 있는지 확인한다.

## Wanted Montage WDS

- [ ] 버튼, 입력, 카드, navigation 같은 공통 UI부터 WDS로 교체한다.
- [ ] desktop/mobile visual QA를 통과한 뒤 WDS migration을 완료로 본다.
