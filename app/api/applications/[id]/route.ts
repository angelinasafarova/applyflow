import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { dbStatements, db } from '@/lib/db';

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

    // Check if application exists
    // Use the same test user ID as in GET route for consistency
    const testUserId = 'hmj234c37ammjias6tj';

    // Ensure test user exists
    dbStatements.createUser.run(testUserId, 'test-user@example.com');
    const application = dbStatements.getApplicationById.get(id, testUserId);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Delete the application (vacancy will remain)
    db.prepare('DELETE FROM applications WHERE id = ? AND user_id = ?').run(id, testUserId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/applications/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
