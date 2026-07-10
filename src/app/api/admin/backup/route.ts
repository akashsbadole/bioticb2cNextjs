import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/admin-auth';

// GET /api/admin/backup - Export all data as JSON
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const [
      stores,
      newsletterSubscribers,
      passwordResetTokens,
      emailVerificationTokens,
      products,
      categories,
      productTiers,
      productVariants,
      blogPosts,
      contentPages,
      banners,
      media,
      enquiries,
      redirects,
      menus,
      menuItems,
      settings,
      users,
      activityLogs,
      notifications,
      companies,
      quotes,
    ] = await Promise.all([
      db.store.findMany(),
      db.newsletterSubscriber.findMany(),
      db.passwordResetToken.findMany(),
      db.emailVerificationToken.findMany(),
      db.product.findMany(),
      db.category.findMany(),
      db.productTier.findMany(),
      db.productVariant.findMany(),
      db.blogPost.findMany(),
      db.contentPage.findMany(),
      db.banner.findMany(),
      db.media.findMany(),
      db.enquiry.findMany(),
      db.redirect.findMany(),
      db.menu.findMany(),
      db.menuItem.findMany(),
      db.siteSetting.findMany(),
      db.user.findMany(),
      db.activityLog.findMany(),
      db.notification.findMany(),
      db.company.findMany(),
      db.quote.findMany(),
    ]);

    const backup = {
      version: '1.1',
      createdAt: new Date().toISOString(),
      data: {
        stores,
        newsletterSubscribers,
        passwordResetTokens,
        emailVerificationTokens,
        products,
        categories,
        productTiers,
        productVariants,
        blogPosts,
        contentPages,
        banners,
        media,
        enquiries,
        redirects,
        menus,
        menuItems,
        settings,
        users,
        activityLogs,
        notifications,
        companies,
        quotes,
      },
    };

    return new NextResponse(JSON.stringify(backup, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    console.error('Backup GET error:', error);
    return NextResponse.json({ error: 'Backup failed' }, { status: 500 });
  }
}

// POST /api/admin/backup - Restore from JSON backup
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request);
    if (!auth.success) return auth.response;

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.name.endsWith('.json')) {
      return NextResponse.json({ error: 'File must be a JSON backup' }, { status: 400 });
    }

    const text = await file.text();
    let backup;
    try {
      backup = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON file' }, { status: 400 });
    }

    if (!backup.data || !['1.0', '1.1'].includes(backup.version)) {
      return NextResponse.json({ error: 'Invalid or unsupported backup format version' }, { status: 400 });
    }

    const { data } = backup;
    const results: Record<string, number> = {};

    await db.$transaction(async (tx) => {
      // 1. Companies
      if (data.companies) {
        for (const item of data.companies) {
          const { id, ...rest } = item;
          await tx.company.upsert({ where: { id }, update: rest, create: { id, ...rest } });
        }
        results.companies = data.companies.length;
      }

      // 2. Users (Pass 1: without currentStoreId)
      if (data.users) {
        for (const item of data.users) {
          const { id, currentStoreId, ...rest } = item;
          await tx.user.upsert({
            where: { id },
            update: { ...rest, currentStoreId: null },
            create: { id, ...rest, currentStoreId: null }
          });
        }
        results.users = data.users.length;
      }

      // 3. Stores
      if (data.stores) {
        for (const item of data.stores) {
          const { id, ...rest } = item;
          await tx.store.upsert({ where: { id }, update: rest, create: { id, ...rest } });
        }
        results.stores = data.stores.length;
      }

      // 4. Users (Pass 2: update currentStoreId)
      if (data.users) {
        for (const item of data.users) {
          if (item.currentStoreId) {
            await tx.user.update({
              where: { id: item.id },
              data: { currentStoreId: item.currentStoreId }
            });
          }
        }
      }

      // 5. Categories (Pass 1: without parentId)
      if (data.categories) {
        for (const item of data.categories) {
          const { id, parentId, ...rest } = item;
          await tx.category.upsert({
            where: { id },
            update: { ...rest, parentId: null },
            create: { id, ...rest, parentId: null }
          });
        }
        results.categories = data.categories.length;
      }

      // 6. Categories (Pass 2: update parentId)
      if (data.categories) {
        for (const item of data.categories) {
          if (item.parentId) {
            await tx.category.update({
              where: { id: item.id },
              data: { parentId: item.parentId }
            });
          }
        }
      }

      // 7. Products
      if (data.products) {
        for (const item of data.products) {
          const { id, ...rest } = item;
          await tx.product.upsert({ where: { id }, update: rest, create: { id, ...rest } });
        }
        results.products = data.products.length;
      }

      // 8. ProductTiers
      if (data.productTiers) {
        for (const item of data.productTiers) {
          const { id, ...rest } = item;
          await tx.productTier.upsert({ where: { id }, update: rest, create: { id, ...rest } });
        }
        results.productTiers = data.productTiers.length;
      }

      // 9. ProductVariants
      if (data.productVariants) {
        for (const item of data.productVariants) {
          const { id, ...rest } = item;
          await tx.productVariant.upsert({ where: { id }, update: rest, create: { id, ...rest } });
        }
        results.productVariants = data.productVariants.length;
      }

      // 10. BlogPosts
      if (data.blogPosts) {
        for (const item of data.blogPosts) {
          const { id, ...rest } = item;
          await tx.blogPost.upsert({ where: { id }, update: rest, create: { id, ...rest } });
        }
        results.blogPosts = data.blogPosts.length;
      }

      // 11. ContentPages
      if (data.contentPages) {
        for (const item of data.contentPages) {
          const { id, ...rest } = item;
          await tx.contentPage.upsert({ where: { id }, update: rest, create: { id, ...rest } });
        }
        results.contentPages = data.contentPages.length;
      }

      // 12. Banners
      if (data.banners) {
        for (const item of data.banners) {
          const { id, ...rest } = item;
          await tx.banner.upsert({ where: { id }, update: rest, create: { id, ...rest } });
        }
        results.banners = data.banners.length;
      }

      // 13. Media
      if (data.media) {
        for (const item of data.media) {
          const { id, ...rest } = item;
          await tx.media.upsert({ where: { id }, update: rest, create: { id, ...rest } });
        }
        results.media = data.media.length;
      }

      // 14. Enquiries
      if (data.enquiries) {
        for (const item of data.enquiries) {
          const { id, ...rest } = item;
          await tx.enquiry.upsert({ where: { id }, update: rest, create: { id, ...rest } });
        }
        results.enquiries = data.enquiries.length;
      }

      // 15. Redirects
      if (data.redirects) {
        for (const item of data.redirects) {
          const { id, ...rest } = item;
          await tx.redirect.upsert({ where: { id }, update: rest, create: { id, ...rest } });
        }
        results.redirects = data.redirects.length;
      }

      // 16. Menus
      if (data.menus) {
        for (const item of data.menus) {
          const { id, ...rest } = item;
          await tx.menu.upsert({ where: { id }, update: rest, create: { id, ...rest } });
        }
        results.menus = data.menus.length;
      }

      // 17. MenuItems (Pass 1: without parentId)
      if (data.menuItems) {
        for (const item of data.menuItems) {
          const { id, parentId, ...rest } = item;
          await tx.menuItem.upsert({
            where: { id },
            update: { ...rest, parentId: null },
            create: { id, ...rest, parentId: null }
          });
        }
        results.menuItems = data.menuItems.length;
      }

      // 18. MenuItems (Pass 2: update parentId)
      if (data.menuItems) {
        for (const item of data.menuItems) {
          if (item.parentId) {
            await tx.menuItem.update({
              where: { id: item.id },
              data: { parentId: item.parentId }
            });
          }
        }
      }

      // 19. Settings
      if (data.settings) {
        for (const item of data.settings) {
          const { id, ...rest } = item;
          await tx.siteSetting.upsert({ where: { id }, update: rest, create: { id, ...rest } });
        }
        results.settings = data.settings.length;
      }

      // 20. ActivityLogs
      if (data.activityLogs) {
        for (const item of data.activityLogs) {
          const { id, ...rest } = item;
          await tx.activityLog.upsert({ where: { id }, update: rest, create: { id, ...rest } });
        }
        results.activityLogs = data.activityLogs.length;
      }

      // 21. Notifications
      if (data.notifications) {
        for (const item of data.notifications) {
          const { id, ...rest } = item;
          await tx.notification.upsert({ where: { id }, update: rest, create: { id, ...rest } });
        }
        results.notifications = data.notifications.length;
      }

      // 22. Quotes
      if (data.quotes) {
        for (const item of data.quotes) {
          const { id, ...rest } = item;
          await tx.quote.upsert({ where: { id }, update: rest, create: { id, ...rest } });
        }
        results.quotes = data.quotes.length;
      }

      // 23. NewsletterSubscribers
      if (data.newsletterSubscribers) {
        for (const item of data.newsletterSubscribers) {
          const { id, ...rest } = item;
          await tx.newsletterSubscriber.upsert({ where: { id }, update: rest, create: { id, ...rest } });
        }
        results.newsletterSubscribers = data.newsletterSubscribers.length;
      }

      // 24. PasswordResetTokens
      if (data.passwordResetTokens) {
        for (const item of data.passwordResetTokens) {
          const { id, ...rest } = item;
          await tx.passwordResetToken.upsert({ where: { id }, update: rest, create: { id, ...rest } });
        }
        results.passwordResetTokens = data.passwordResetTokens.length;
      }

      // 25. EmailVerificationTokens
      if (data.emailVerificationTokens) {
        for (const item of data.emailVerificationTokens) {
          const { id, ...rest } = item;
          await tx.emailVerificationToken.upsert({ where: { id }, update: rest, create: { id, ...rest } });
        }
        results.emailVerificationTokens = data.emailVerificationTokens.length;
      }
    }, {
      timeout: 60000 // Increase timeout for large backups
    });

    return NextResponse.json({
      success: true,
      restored: results,
      message: 'Backup restored successfully',
    });
  } catch (error) {
    console.error('Backup POST error:', error);
    return NextResponse.json({ error: 'Restore failed' }, { status: 500 });
  }
}
