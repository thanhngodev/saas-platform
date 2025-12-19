import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { TenantStatus } from '../entities/tenant.entity';

class UpdateTenantBaseDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus;

  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;

  @IsOptional()
  @Type(() => Date)
  trialEndsAt?: Date;
}

export class UpdateTenantDto extends PartialType(UpdateTenantBaseDto) {}
