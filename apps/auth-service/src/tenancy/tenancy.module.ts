import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantUser } from './entities/tenant-user.entity';
import { TenancyService } from './tenancy.service';
import { TenancyController } from './tenancy.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, TenantUser])],
  providers: [TenancyService],
  controllers: [TenancyController],
  exports: [TenancyService],
})
export class TenancyModule {}
