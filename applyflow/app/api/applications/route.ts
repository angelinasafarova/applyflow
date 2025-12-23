import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { dbStatements, generateId } from '@/lib/db';
import { Application } from '@/lib/types';

export async function GET(request: NextRequest) {
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

    const applications = dbStatements.getApplicationsByUserId.all(testUserId) as Application[];

    console.log('API /applications - Raw data from DB:', JSON.stringify(applications, null, 2));

    return NextResponse.json(applications);
  } catch (error) {
    console.error('GET /api/applications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.vacancyId || !body.nextStep) {
      return NextResponse.json(
        { error: 'Vacancy ID and next step are required' },
        { status: 400 }
      );
    }

    // Check if vacancy exists and belongs to user
    const vacancy = dbStatements.getVacancyById.get(body.vacancyId, user.id);
    if (!vacancy) {
      return NextResponse.json({ error: 'Vacancy not found' }, { status: 404 });
    }

    const applicationId = generateId();

    dbStatements.createApplication.run(
      applicationId,
      user.id,
      body.vacancyId,
      body.status || 'saved',
      body.nextStep,
      body.nextStepDueDate || null
    );

    const application = dbStatements.getApplicationById.get(applicationId, user.id) as Application;

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('POST /api/applications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
