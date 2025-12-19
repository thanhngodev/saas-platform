/* eslint-disable */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TenancyService } from './tenancy.service';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('tenants')
@ApiBearerAuth()
@Controller('tenants')
@UseGuards(JwtAuthGuard)
export class TenancyController {
  constructor(private readonly tenancyService: TenancyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tenant' })
  @ApiResponse({ status: 201, description: 'Tenant successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async create(
    @Body() createTenantDto: CreateTenantDto,
    @Request() req,
  ): Promise<Tenant> {
    return this.tenancyService.createTenant(createTenantDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tenants for the current user' })
  @ApiResponse({ status: 200, description: 'Returns the list of tenants.' })
  async getUserTenants(@Request() req): Promise<Tenant[]> {
    return this.tenancyService.getUserTenants(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tenant by ID' })
  @ApiResponse({ status: 200, description: 'Returns the tenant.' })
  @ApiResponse({ status: 404, description: 'Tenant not found.' })
  async findOne(@Param('id') id: string): Promise<Tenant> {
    return this.tenancyService.findTenantById(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a tenant by slug' })
  @ApiResponse({ status: 200, description: 'Returns the tenant.' })
  @ApiResponse({ status: 404, description: 'Tenant not found.' })
  async findBySlug(@Param('slug') slug: string): Promise<Tenant> {
    return this.tenancyService.findTenantBySlug(slug);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a tenant' })
  @ApiResponse({ status: 200, description: 'Tenant updated successfully.' })
  @ApiResponse({ status: 404, description: 'Tenant not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ): Promise<Tenant> {
    return this.tenancyService.updateTenant(id, updateTenantDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tenant' })
  @ApiResponse({ status: 200, description: 'Tenant deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Tenant not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.tenancyService.removeTenant(id);
  }

  @Get(':id/users')
  @ApiOperation({ summary: 'Get all users for a tenant' })
  @ApiResponse({
    status: 200,
    description: 'Returns the list of users in the tenant.',
  })
  async getTenantUsers(@Param('id') id: string) {
    return this.tenancyService.getTenantUsers(id);
  }
}
