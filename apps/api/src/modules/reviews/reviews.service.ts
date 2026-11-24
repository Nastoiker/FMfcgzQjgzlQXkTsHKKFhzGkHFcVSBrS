import { Injectable, NotFoundException } from '@nestjs/common';

import { AccessScope } from '@/common/access-scope';
import type { TUser } from '@/modules/auth/identity';
import { Selection } from '@/modules/branches/selection.service';
import type { TReviewStatus } from '@/modules/reviews/dto/reviews.dto';
import { ReviewFilters } from '@/modules/reviews/dto/reviews.dto';
import { ReviewsRepository } from '@/modules/reviews/reviews.repository';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly repo: ReviewsRepository,
    private readonly selection: Selection,
    private readonly scope: AccessScope,
  ) {}
  async list(viewer: TUser, filters: ReviewFilters) {
    const rows = await this.repo.list(await this.selection.ids(viewer, filters), filters);
    const items = rows.slice(0, filters.limit);
    return { items, next: rows.length > filters.limit ? items.at(-1)?.id : undefined };
  }
  async change(viewer: TUser, id: number, status: TReviewStatus) {
    const review = (await this.repo.change(this.scope.predicate(viewer, {}), id, status)).at(0);
    if (!review) throw new NotFoundException('Отзыв не найден');
    return review;
  }
}
