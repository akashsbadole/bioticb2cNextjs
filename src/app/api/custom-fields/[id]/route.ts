import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { validateBody } from '@/lib/validate';
import { customFieldDefinitionSchema } from '@/lib/validations';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth(_request);
    if (!auth.success) return auth.response;

    const { id } = await params;
    const definition = await db.customFieldDefinition.findFirst({
      where: { id },
    });

    if (!definition) {
      return NextResponse.json({ error: 'Custom field not found' }, { status: 404 });
    }

    return NextResponse.json({ definition });
  } catch (error) {
    console.error('Get custom field error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;
    const existing = await db.customFieldDefinition.findFirst({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Custom field not found' }, { status: 404 });
    }

    const parsed = await validateBody(request, customFieldDefinitionSchema);
    if (parsed.response) return parsed.response;

    const { entityType, name, type, options, isRequired, isVisible, sortOrder } = parsed.data;

    const definition = await db.customFieldDefinition.update({
      where: { id },
      data: {
        ...(entityType !== undefined && { entityType }),
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(options !== undefined && { options: options || '[]' }),
        ...(isRequired !== undefined && { isRequired }),
        ...(isVisible !== undefined && { isVisible }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json({ definition });
  } catch (error) {
    console.error('Update custom field error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const { id } = await params;
    const existing = await db.customFieldDefinition.findFirst({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Custom field not found' }, { status: 404 });
    }

    await db.customFieldDefinition.delete({ where: { id } });

    return NextResponse.json({ message: 'Custom field deleted successfully' });
  } catch (error) {
    console.error('Delete custom field error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
