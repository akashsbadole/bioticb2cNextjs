import { NextRequest, NextResponse } from 'next/server';
import { ZodType } from 'zod';

/**
 * Parse and validate a JSON request body against a Zod schema.
 *
 * Returns `{ data }` on success, or `{ response }` with a 400
 * `NextResponse` describing the field errors on failure. This standardizes
 * the validation pattern used across mutation routes (audit 4.4).
 *
 * Usage:
 *   const result = await validateBody(request, userUpdateSchema);
 *   if (result.response) return result.response;
 *   const { name, email } = result.data;
 */
export async function validateBody<T extends ZodType>(
  request: NextRequest,
  schema: T
): Promise<
  | { data: T['_output']; response?: undefined }
  | { data?: undefined; response: NextResponse }
> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      response: NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }),
    };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      response: NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      ),
    };
  }

  return { data: result.data };
}
