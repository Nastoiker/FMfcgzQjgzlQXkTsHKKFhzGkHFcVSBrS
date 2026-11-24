import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const db = new PrismaClient();
const seed = async () => {
  const password = await bcrypt.hash('Demo-Atlas-42', 10);
  await db.$transaction(async (tx) => {
    await tx.$executeRaw`select pg_advisory_xact_lock(71042)`;
    if (await tx.company.count()) return;
    await tx.company.createMany({
      data: [
        { id: 1, name: 'Лунный атлас' },
        { id: 2, name: 'Янтарный берег' },
      ],
    });
    await tx.branch.createMany({
      data: ['Северный', 'Центральный', 'Прибрежный', 'Садовый'].map((name, i) => ({
        id: i + 1,
        company_id: i < 2 ? 1 : 2,
        name,
      })),
    });
    await tx.user.createMany({
      data: [
        { login: 'admin@example.com', role: 'admin', password },
        { login: 'client@example.com', role: 'client', company_id: 1, password },
      ],
    });
    await tx.$executeRaw`insert into daily_metrics select b.id,current_date-i, (95+b.id*14+round(14*cos(i*2*pi()/7)+8*sin(i*.4)))::int,14+b.id+i%9,3+i%5,5+i%8 from branches b cross join generate_series(0,119) i`;
    await tx.$executeRaw`insert into reviews(branch_id,created_at,rating,status,text,author) select 1+i%4,current_date-i,1+i%5,(array['new','in_progress','resolved'])[1+i%3],(array['Быстро ответили','Удобный вход','Пришлось подождать'])[1+i%3],'Гость '||(i+1) from generate_series(0,47) i`;
  });
};
seed()
  .catch(() => {
    process.stderr.write('Сбой заполнения базы данных\n');
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
