import { NextResponse } from 'next/server';
import { getAllCourses } from '@/lib/courses';

export const dynamic = 'force-dynamic';

export async function GET() {
  const courses = getAllCourses();
  return NextResponse.json(courses);
}

