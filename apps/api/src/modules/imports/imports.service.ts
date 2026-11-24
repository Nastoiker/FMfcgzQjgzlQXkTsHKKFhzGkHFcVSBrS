import { BadGatewayException, Injectable } from '@nestjs/common';

import { validatePeriod } from '@/common/period';
import type { TUser } from '@/modules/auth/identity';
import { BranchesService } from '@/modules/branches/branches.service';
import { ImportPeriod } from '@/modules/imports/dto/imports.dto';
import { download, SourceFailure } from '@/modules/imports/import-source';
import { ImportsRepository } from '@/modules/imports/imports.repository';

@Injectable()
export class ImportsService {
  constructor(
    private readonly branches: BranchesService,
    private readonly repo: ImportsRepository,
  ) {}
  async run(viewer: TUser, period: ImportPeriod) {
    validatePeriod(period);
    await this.branches.one(viewer, period.branchId);
    const { id } = await this.repo.start(period);
    let attempts = 0;
    try {
      const data = await download(period, () => {
        attempts++;
      });
      await this.repo.finish(id, data, attempts);
      return { rows: data.length };
    } catch (e) {
      const cause = e instanceof SourceFailure ? e.message : 'Ошибка записи статистики';
      await this.repo.fail(id, cause, attempts);
      throw new BadGatewayException('Импорт не завершён');
    }
  }
}
