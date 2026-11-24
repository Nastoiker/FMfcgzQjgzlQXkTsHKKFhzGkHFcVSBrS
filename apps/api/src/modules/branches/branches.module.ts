import { Module } from '@nestjs/common';

import { AccessScope } from '@/common/access-scope';
import { BranchesController } from '@/modules/branches/branches.controller';
import { BranchesRepository } from '@/modules/branches/branches.repository';
import { BranchesService } from '@/modules/branches/branches.service';
import { Selection } from '@/modules/branches/selection.service';

@Module({
  controllers: [BranchesController],
  providers: [BranchesService, BranchesRepository, AccessScope, Selection],
  exports: [BranchesService, AccessScope, Selection],
})
export class BranchesModule {}
