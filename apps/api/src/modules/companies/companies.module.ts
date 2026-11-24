import { Module } from '@nestjs/common';

import { CompaniesController } from '@/modules/companies/companies.controller';
import { CompaniesRepository } from '@/modules/companies/companies.repository';
import { CompaniesService } from '@/modules/companies/companies.service';

@Module({ controllers: [CompaniesController], providers: [CompaniesService, CompaniesRepository] })
export class CompaniesModule {}
