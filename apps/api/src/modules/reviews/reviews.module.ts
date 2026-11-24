import { Module } from '@nestjs/common';

import { BranchesModule } from '@/modules/branches/branches.module';
import { ReviewsController } from '@/modules/reviews/reviews.controller';
import { ReviewsRepository } from '@/modules/reviews/reviews.repository';
import { ReviewsService } from '@/modules/reviews/reviews.service';

@Module({
  imports: [BranchesModule],
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewsRepository],
})
export class ReviewsModule {}
