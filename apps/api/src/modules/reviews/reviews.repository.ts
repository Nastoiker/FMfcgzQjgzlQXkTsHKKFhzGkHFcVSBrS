import { Injectable } from '@nestjs/common';
import type { Review } from '@prisma/client';
import { Prisma } from '@prisma/client';

import { db } from '@/common/database';
import type { TReviewStatus } from '@/modules/reviews/dto/reviews.dto';
import { ReviewFilters } from '@/modules/reviews/dto/reviews.dto';

export const reviewSql = (ids: Prisma.Sql, filters: ReviewFilters): Prisma.Sql => {
  const rating =
    filters.rating === undefined ? Prisma.empty : Prisma.sql`AND r.rating = ${filters.rating}`;
  const status =
    filters.status === undefined ? Prisma.empty : Prisma.sql`AND r.status = ${filters.status}`;
  const cursor =
    filters.cursor === undefined
      ? Prisma.empty
      : Prisma.sql`
      AND (r.created_at, -r.id) < (
        SELECT a.created_at, -a.id FROM reviews a
        WHERE a.id = ${filters.cursor} AND a.branch_id IN (SELECT id FROM visible))`;
  return Prisma.sql`
      WITH visible AS (${ids})
      SELECT r.id, r.branch_id, r.created_at, r.rating, r.status, r.text, r.author
      FROM reviews r WHERE r.branch_id IN (SELECT id FROM visible)
        AND r.created_at >= ${filters.from}::date AND r.created_at < ${filters.to}::date + 1
        ${rating} ${status} ${cursor}
      ORDER BY r.created_at DESC, r.id ASC LIMIT ${filters.limit + 1}`;
};

@Injectable()
export class ReviewsRepository {
  list(ids: Prisma.Sql, filters: ReviewFilters) {
    return db.$queryRaw<Review[]>(reviewSql(ids, filters));
  }
  change(predicate: Prisma.Sql, id: number, status: TReviewStatus) {
    return db.$queryRaw<Pick<Review, 'id' | 'status'>[]>`
      UPDATE reviews r SET status = ${status} FROM branches b
      WHERE r.branch_id = b.id AND r.id = ${id} AND ${predicate}
      RETURNING r.id, r.status`;
  }
}
