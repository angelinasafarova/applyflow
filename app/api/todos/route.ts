import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { dbStatements, generateId } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Temporarily disable auth check for testing
    // const user = getCurrentUser(request);
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const testUserId = 'hmj234c37ammjias6tj';
    const todos = dbStatements.getTodosByUserId.all(testUserId).map(todo => ({
      ...todo,
      completed: Boolean(todo.completed)
    }));

    return NextResponse.json(todos);
  } catch (error) {
    console.error('GET /api/todos error:', error);
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

    const testUserId = 'hmj234c37ammjias6tj';

    // Ensure test user exists
    dbStatements.createUser.run(testUserId, 'test-user@example.com');

    const body = await request.json();

    if (!body.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const todoId = generateId();

    dbStatements.createTodo.run(
      todoId,
      testUserId,
      body.applicationId || null,
      body.title,
      body.description || '',
      body.priority || 'medium',
      body.dueDate || null,
      0
    );

    const todo = dbStatements.getTodosByUserId.all(testUserId).find(t => t.id === todoId);

    return NextResponse.json({
      ...todo,
      completed: Boolean(todo.completed)
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/todos error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
