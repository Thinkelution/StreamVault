import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash('StreamVault2026!', 12);
  const editorHash = await bcrypt.hash('Editor2026!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'demo@streamvault.io' },
    update: {},
    create: {
      email: 'demo@streamvault.io',
      passwordHash: adminHash,
      name: 'Demo Admin',
      role: 'super_admin',
      isActive: true,
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: 'editor@streamvault.io' },
    update: {},
    create: {
      email: 'editor@streamvault.io',
      passwordHash: editorHash,
      name: 'Demo Editor',
      role: 'editor',
      isActive: true,
    },
  });

  console.log('Seeded users:', { admin: admin.id, editor: editor.id });

  const categoryData = [
    { name: 'News', slug: 'news' },
    { name: 'Sports', slug: 'sports' },
    { name: 'Entertainment', slug: 'entertainment' },
    { name: 'Technology', slug: 'technology' },
    { name: 'Education', slug: 'education' },
  ];

  for (const cat of categoryData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('Seeded categories');

  const tagData = [
    { name: 'Trending', slug: 'trending' },
    { name: 'Featured', slug: 'featured' },
    { name: 'Breaking', slug: 'breaking' },
    { name: 'Tutorial', slug: 'tutorial' },
    { name: 'Review', slug: 'review' },
  ];

  for (const tag of tagData) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }
  console.log('Seeded tags');

  await prisma.feed.upsert({
    where: { slug: 'main-feed' },
    update: {},
    create: {
      name: 'Main Feed',
      slug: 'main-feed',
      description: 'Primary MRSS feed for all published videos',
      type: 'mrss',
      sortOrder: 'newest',
      itemLimit: 50,
      isActive: true,
      cacheTtl: 300,
      language: 'en',
    },
  });
  console.log('Seeded feeds');

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
