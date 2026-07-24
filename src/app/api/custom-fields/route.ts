import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { validateBody } from '@/lib/validate';
import { customFieldDefinitionSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');

    if (!entityType) {
      return NextResponse.json(
        { error: 'entityType query parameter is required (product|category)' },
        { status: 400 }
      );
    }

    const definitions = await db.customFieldDefinition.findMany({
      where: {
        ...(storeId ? { storeId } : {}),
        entityType,
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ definitions });
  } catch (error) {
    console.error('Get custom fields error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const parsed = await validateBody(request, customFieldDefinitionSchema);
    if (parsed.response) return parsed.response;

    const { entityType, name, type, options, isRequired, isVisible, sortOrder } = parsed.data;
    const storeId = getStoreId(request);

    const definition = await db.customFieldDefinition.create({
      data: {
        storeId,
        entityType,
        name,
        type,
        options: options || '[]',
        isRequired,
        isVisible,
        sortOrder,
      },
    });

    return NextResponse.json({ definition }, { status: 201 });
  } catch (error) {
    console.error('Create custom field error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
