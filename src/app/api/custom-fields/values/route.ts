import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { validateBody } from '@/lib/validate';
import { customFieldValueSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const storeId = getStoreId(request);
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'entityType and entityId query parameters are required' },
        { status: 400 }
      );
    }

    const values = await db.customFieldValue.findMany({
      where: {
        ...(storeId ? { storeId } : {}),
        entityType,
        entityId,
      },
      include: {
        Definition: true,
      },
      orderBy: {
        Definition: {
          sortOrder: 'asc',
        },
      },
    });

    const formatted = values.map((v) => ({
      id: v.id,
      definitionId: v.definitionId,
      entityId: v.entityId,
      entityType: v.entityType,
      value: v.value,
      definition: {
        id: v.Definition.id,
        name: v.Definition.name,
        type: v.Definition.type,
        isVisible: v.Definition.isVisible,
        options: v.Definition.options,
      },
    }));

    return NextResponse.json({ values: formatted });
  } catch (error) {
    console.error('Get custom field values error:', error);
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

    const parsed = await validateBody(request, customFieldValueSchema);
    if (parsed.response) return parsed.response;

    const { definitionId, entityId, entityType, value } = parsed.data;
    const storeId = getStoreId(request);

    const definition = await db.customFieldDefinition.findFirst({
      where: { id: definitionId },
    });
    if (!definition) {
      return NextResponse.json({ error: 'Custom field definition not found' }, { status: 404 });
    }

    const existing = await db.customFieldValue.findFirst({
      where: {
        definitionId,
        entityId,
        entityType,
      },
    });

    let fieldValue;
    if (existing) {
      fieldValue = await db.customFieldValue.update({
        where: { id: existing.id },
        data: { value },
        include: { Definition: true },
      });
    } else {
      fieldValue = await db.customFieldValue.create({
        data: {
          definitionId,
          entityId,
          entityType,
          storeId,
          value,
        },
        include: { Definition: true },
      });
    }

    return NextResponse.json({
      value: {
        id: fieldValue.id,
        definitionId: fieldValue.definitionId,
        entityId: fieldValue.entityId,
        entityType: fieldValue.entityType,
        value: fieldValue.value,
        definition: {
          id: fieldValue.Definition.id,
          name: fieldValue.Definition.name,
          type: fieldValue.Definition.type,
          isVisible: fieldValue.Definition.isVisible,
          options: fieldValue.Definition.options,
        },
      },
    });
  } catch (error) {
    console.error('Set custom field value error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
