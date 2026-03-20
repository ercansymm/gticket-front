import { NextResponse } from 'next/server';

// Bu endpoint kaldırıldı — update-passengers ve make-prebooking kullanılmalı
export async function POST() {
  return NextResponse.json(
    { error: 'Bu endpoint kullanımdan kaldırıldı. /api/flight/update-passengers ve /api/flight/make-prebooking kullanın.' },
    { status: 410 },
  );
}
