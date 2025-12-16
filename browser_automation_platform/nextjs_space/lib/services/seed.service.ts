import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { getRandomUserAgent } from '../utils/user-agents';

const prisma = new PrismaClient();

export async function seedDatabase() {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: 'john@doe.com' },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('johndoe123', 12);
      await prisma.user.create({
        data: {
          email: 'john@doe.com',
          name: 'John Doe',
          password: hashedPassword,
          role: Role.ADMIN,
          emailVerified: new Date(),
        },
      });
      console.log('Admin user created');
    }

    const scriptCount = await prisma.script.count();
    if (scriptCount === 0) {
      const adminUser = await prisma.user.findUnique({
        where: { email: 'john@doe.com' },
      });

      if (adminUser) {
        await prisma.script.createMany({
          data: [
            {
              name: 'YouTube Automation',
              description: 'Auto-skip ads, prevent pause, simulate activity',
              platform: 'YOUTUBE',
              code: '// See public/scripts/youtube.js',
              authorId: adminUser.id,
              isPublic: true,
            },
            {
              name: 'Spotify Automation',
              description: 'Prevent pause, close modals',
              platform: 'SPOTIFY',
              code: '// See public/scripts/spotify.js',
              authorId: adminUser.id,
              isPublic: true,
            },
            {
              name: 'Deezer Automation',
              description: 'Prevent pause, close popups',
              platform: 'DEEZER',
              code: '// See public/scripts/deezer.js',
              authorId: adminUser.id,
              isPublic: true,
            },
            {
              name: 'TikTok Automation',
              description: 'Auto-scroll, prevent pause',
              platform: 'TIKTOK',
              code: '// See public/scripts/tiktok.js',
              authorId: adminUser.id,
              isPublic: true,
            },
          ],
        });
        console.log('Default scripts created');
      }
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}
