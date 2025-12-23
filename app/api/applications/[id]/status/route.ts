import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { dbStatements, generateId } from '@/lib/db';

const validStatuses = ['saved', 'applied', 'screening', 'test', 'interview', 'offer', 'rejected'];

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

    // Use a test user ID for now
    const testUserId = 'hmj234c37ammjias6tj';

    // Ensure test user exists
    dbStatements.createUser.run(testUserId, 'test-user@example.com');

    const { id } = await params;
    const body = await request.json();

    console.log('PUT /api/applications/[id]/status - Full request:', {
      id,
      body,
      nextStep: body.nextStep,
      nextStepType: typeof body.nextStep,
      nextStepLength: body.nextStep?.length,
      status: body.status
    });

    if (!body.status || !validStatuses.includes(body.status)) {
      return NextResponse.json({ error: 'Valid status is required' }, { status: 400 });
    }

    // Next step is optional - if provided, create a todo item with the user's text

    // Check if application exists and belongs to user
    const existingApp = dbStatements.getApplicationById.get(id, testUserId);
    if (!existingApp) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Set applied_date when status changes to 'applied'
    const appliedDate = body.status === 'applied' ? new Date().toISOString() :
                        (existingApp as any).applied_date;

    dbStatements.updateApplicationStatus.run(
      body.status,
      body.nextStep || (existingApp as any).nextStep,
      body.nextStepDueDate || (existingApp as any).nextStepDueDate,
      appliedDate,
      id,
      testUserId
    );

    // If user provided a task in the "Create a new task" field, create a todo
    console.log('Checking todo creation:', {
      nextStep: body.nextStep,
      nextStepTrimmed: body.nextStep?.trim(),
      shouldCreate: body.nextStep && body.nextStep.trim() !== ''
    });

    if (body.nextStep && body.nextStep.trim() !== '') {
      console.log('Creating todo with user-provided text:', body.nextStep.trim());
      const todoId = generateId();
      const todoTitle = body.nextStep.trim();

      console.log('Todo details:', { todoId, title: todoTitle, applicationId: id });

      dbStatements.createTodo.run(
        todoId,
        testUserId,
        id, // application_id
        todoTitle,
        `Complete next steps for ${body.status} status`,
        'medium',
        body.nextStepDueDate || null,
        0
      );

      console.log('Todo created successfully');
    }

    const updatedApplication = dbStatements.getApplicationById.get(id, testUserId);

    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error('PUT /api/applications/[id]/status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
