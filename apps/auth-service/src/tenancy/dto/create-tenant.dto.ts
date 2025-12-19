import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TenantStatus } from '../entities/tenant.entity';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsOptional()
  description?: string;

  @IsEnum(TenantStatus)
  @IsOptional()
  status: TenantStatus = TenantStatus.ACTIVE;

  @IsObject()
  @IsOptional()
  settings: Record<string, any> = {};

  @IsOptional()
  @Type(() => Date)
  trialEndsAt?: Date;
}
