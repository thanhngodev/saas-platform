/* eslint-disable */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { TenantUser } from './entities/tenant-user.entity';
import { Tenant, TenantStatus } from './entities/tenant.entity';
import { TenantUserRole } from './entities/tenant-user.entity';

@Injectable()
export class TenancyService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(TenantUser)
    private readonly tenantUserRepository: Repository<TenantUser>,
  ) {}

  async createTenant(
    createTenantDto: CreateTenantDto,
    owner: User,
  ): Promise<Tenant> {
    const tenant = this.tenantRepository.create({
      ...createTenantDto,
      status: TenantStatus.ACTIVE,
    });

    const savedTenant = await this.tenantRepository.save(tenant);

    // Add the owner as an admin of the tenant
    await this.addUserToTenant(owner.id, savedTenant.id, TenantUserRole.OWNER);

    return savedTenant;
  }

  async findTenantById(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return tenant;
  }

  async findTenantBySlug(slug: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ 
      where: { slug },
      relations: ['users']
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant with slug ${slug} not found`);
    }
    return tenant;
  }

  async addUserToTenant(
    userId: string,
    tenantId: string,
    role: TenantUserRole = TenantUserRole.MEMBER,
  ): Promise<TenantUser> {
    const existing = await this.tenantUserRepository.findOne({
      where: { userId, tenantId },
    });

    if (existing) {
      return existing;
    }

    const tenantUser = this.tenantUserRepository.create({
      userId,
      tenantId,
      role,
      isActive: true,
    });

    return this.tenantUserRepository.save(tenantUser);
  }

  async getUserTenants(userId: string): Promise<Tenant[]> {
    const tenantUsers = await this.tenantUserRepository.find({
      where: { userId },
      relations: ['tenant'],
    });
    
    return tenantUsers.map((tu) => tu.tenant).filter((t): t is Tenant => t !== null);
  }

  async getTenantUsers(tenantId: string): Promise<TenantUser[]> {
    return this.tenantUserRepository.find({
      where: { tenantId },
      relations: ['user'],
    });
  }

  async updateTenant(id: string, updateData: Partial<Tenant>): Promise<Tenant> {
    const tenant = await this.findTenantById(id);
    Object.assign(tenant, updateData);
    return this.tenantRepository.save(tenant);
  }

  async removeTenant(id: string): Promise<void> {
    const result = await this.tenantRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
  }
}
