import { Module } from '@nestjs/common';

import { BranchesModule } from '@/modules/branches/branches.module';
import { ImportsController } from '@/modules/imports/imports.controller';
import { ImportsRepository } from '@/modules/imports/imports.repository';
import { ImportsService } from '@/modules/imports/imports.service';

@Module({
  imports: [BranchesModule],
  controllers: [ImportsController],
  providers: [ImportsService, ImportsRepository],
})
export class ImportsModule {}
