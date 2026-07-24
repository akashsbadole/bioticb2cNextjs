import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getStoreId } from '@/lib/store-db';
import { requireAdminAuth } from '@/lib/admin-auth';
import { validateBody } from '@/lib/validate';
import { customFieldValuesBulkSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const parsed = await validateBody(request, customFieldValuesBulkSchema);
    if (parsed.response) return parsed.response;

    const { entityType, entityId, values } = parsed.data;
    const storeId = getStoreId(request);

    interface CustomFieldValueResult {
      id: string;
      definitionId: string;
      entityId: string;
      entityType: string;
      value: string;
      definition: {
        id: string;
        name: string;
        type: string;
        isVisible: boolean;
        options: string;
      };
    }

    const results: CustomFieldValueResult[] = [];
    for (const item of values) {
      const definition = await db.customFieldDefinition.findFirst({
        where: { id: item.definitionId },
      });
      if (!definition) continue;

      const existing = await db.customFieldValue.findFirst({
        where: {
          definitionId: item.definitionId,
          entityId,
          entityType,
        },
      });

      let fieldValue;
      if (existing) {
        fieldValue = await db.customFieldValue.update({
          where: { id: existing.id },
          data: { value: item.value || '' },
          include: { Definition: true },
        });
      } else {
        fieldValue = await db.customFieldValue.create({
          data: {
            definitionId: item.definitionId,
            entityId,
            entityType,
            storeId,
            value: item.value || '',
          },
          include: { Definition: true },
        });
      }

      const result: CustomFieldValueResult = {
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
      };
      results.push(result);
    }

    return NextResponse.json({ values: results });
  } catch (error) {
    console.error('Bulk set custom field values error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
