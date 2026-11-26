import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding database...');

    const mockUser = await prisma.user.create({
        data: {
            email: 'seeder@example.com',
            name: 'Seeder',
        }
    });

    const mockArticle = await prisma.blogPost.create({
        data: {
            title: 'Getting Started with Node.js and PostgreSQL',
            content: 'This is a mock article content for testing your Prisma setup.',
            published: true,
            category: 'TECHNOLOGY',
            authorId: mockUser.id,
        },
    });

    console.log(`✅ Created mock article with ID: ${mockArticle.id}`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });