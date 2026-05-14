import { NextResponse } from 'next/server';

const firebasePublicEnvKeys = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

export function GET() {
  const missingFirebaseKeys = firebasePublicEnvKeys.filter(
    (key) => !process.env[key],
  );

  return NextResponse.json({
    firebaseConfigured: missingFirebaseKeys.length === 0,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    geminiModel: process.env.GEMINI_MODEL ?? 'gemini-2.0-flash',
    missingFirebaseKeys,
  });
}
