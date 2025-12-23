import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { dbStatements, generateId } from '@/lib/db';
import { Vacancy, VacancyForm } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    // Temporarily disable auth check for testing
    // const user = getCurrentUser(request);
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Use a test user ID for now
    const testUserId = 'hmj234c37ammjias6tj';
    const vacancies = dbStatements.getVacanciesByUserId.all(testUserId) as Vacancy[];

    return NextResponse.json(vacancies);
  } catch (error) {
    console.error('GET /api/vacancies error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Temporarily disable auth check for testing
    // const user = getCurrentUser(request);
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Use a test user ID for now
    const testUserId = 'hmj234c37ammjias6tj';

    // Ensure test user exists
    dbStatements.createUser.run(testUserId, 'test-user@example.com');

    const body: VacancyForm = await request.json();

    // Validate required fields
    if (!body.companyName || !body.roleTitle || !body.link) {
      return NextResponse.json(
        { error: 'Company name, role title, and link are required' },
        { status: 400 }
      );
    }

    // Validate source enum
    const validSources = ['linkedin', 'hh', 'indeed', 'telegram', 'direct', 'other'];
    if (body.source && !validSources.includes(body.source)) {
      return NextResponse.json({ error: 'Invalid source' }, { status: 400 });
    }

    const vacancyId = generateId();

    dbStatements.createVacancy.run(
      vacancyId,
      testUserId,
      body.companyName,
      body.roleTitle,
      body.link,
      body.source || null,
      body.salaryRange || null,
      body.location || null,
      body.notes || null
    );

    // Also create initial application with 'saved' status
    const applicationId = generateId();
    dbStatements.createApplication.run(
      applicationId,
      testUserId,
      vacancyId,
      'saved',
      'Review and apply to this vacancy',
      null
    );

    const vacancy = dbStatements.getVacancyById.get(vacancyId, testUserId) as Vacancy;

    return NextResponse.json(vacancy, { status: 201 });
  } catch (error) {
    console.error('POST /api/vacancies error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
