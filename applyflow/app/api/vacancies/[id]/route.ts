import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { dbStatements, db } from '@/lib/db';
import { Vacancy, VacancyForm } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Temporarily disable auth check for testing
    // const user = getCurrentUser(request);
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { id } = await params;
    // Use test user ID for now
    const testUserId = 'hmj234c37ammjias6tj';

    // Ensure test user exists
    dbStatements.createUser.run(testUserId, 'test-user@example.com');
    const vacancy = dbStatements.getVacancyById.get(id, testUserId) as Vacancy | undefined;

    if (!vacancy) {
      return NextResponse.json({ error: 'Vacancy not found' }, { status: 404 });
    }

    console.log('API GET /vacancies/[id] - Vacancy data:', vacancy);

    return NextResponse.json(vacancy);
  } catch (error) {
    console.error('GET /api/vacancies/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Temporarily disable auth check for testing
    // const user = getCurrentUser(request);
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { id } = await params;
    const body: Partial<VacancyForm> = await request.json();

    // Use test user ID for now
    const testUserId = 'hmj234c37ammjias6tj';

    console.log('PUT /api/vacancies/[id] - Body:', body);
    console.log('PUT /api/vacancies/[id] - ID:', id);

    // Validate source enum if provided
    const validSources = ['linkedin', 'hh', 'indeed', 'telegram', 'direct', 'other'];
    if (body.source && !validSources.includes(body.source)) {
      return NextResponse.json({ error: 'Invalid source' }, { status: 400 });
    }

    // Check if vacancy exists and belongs to user
    const existingVacancy = dbStatements.getVacancyById.get(id, testUserId) as Vacancy | undefined;
    if (!existingVacancy) {
      return NextResponse.json({ error: 'Vacancy not found' }, { status: 404 });
    }

    console.log('PUT /api/vacancies/[id] - Existing vacancy:', existingVacancy);

    const updateParams = [
      body.companyName !== undefined ? body.companyName : existingVacancy.companyName,
      body.roleTitle !== undefined ? body.roleTitle : existingVacancy.roleTitle,
      body.link !== undefined ? body.link : existingVacancy.link,
      body.source !== undefined ? body.source : existingVacancy.source,
      body.salaryRange !== undefined ? body.salaryRange : existingVacancy.salaryRange,
      body.location !== undefined ? body.location : existingVacancy.location,
      body.notes !== undefined ? body.notes : existingVacancy.notes,
      id,
      testUserId
    ];

    console.log('PUT /api/vacancies/[id] - Update params:', updateParams);

    dbStatements.updateVacancy.run(...updateParams);

    const updatedVacancy = dbStatements.getVacancyById.get(id, testUserId) as Vacancy;

    console.log('PUT /api/vacancies/[id] - Updated vacancy:', updatedVacancy);

    return NextResponse.json(updatedVacancy);
  } catch (error) {
    console.error('PUT /api/vacancies/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Temporarily disable auth check for testing
    // const user = getCurrentUser(request);
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { id } = await params;

    // Use test user ID for now
    const testUserId = 'hmj234c37ammjias6tj';

    // Check if vacancy exists and belongs to user
    const vacancy = dbStatements.getVacancyById.get(id, testUserId) as Vacancy | undefined;
    if (!vacancy) {
      return NextResponse.json({ error: 'Vacancy not found' }, { status: 404 });
    }

    // Note: SQLite foreign key constraints will handle cascading deletes
    // for applications and contacts when vacancy is deleted

    // Delete vacancy (this will cascade to applications and contacts)
    const deleteStmt = db.prepare('DELETE FROM vacancies WHERE id = ? AND user_id = ?');
    deleteStmt.run(id, testUserId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/vacancies/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
