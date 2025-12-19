import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { TenantUser } from '../../tenancy/entities/tenant-user.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true, select: false })
  password?: string;

  @Column({ default: false })
  isEmailVerified: boolean = false;

  @Column({ nullable: true, select: false })
  emailVerificationToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  emailVerificationExpires?: Date;

  @Column({ nullable: true, select: false })
  passwordResetToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires?: Date;

  @Column({ nullable: true, select: false })
  refreshToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  refreshTokenExpires?: Date;

  @Column({ default: true })
  isActive: boolean = true;

  @OneToMany(() => TenantUser, (tenantUser) => tenantUser.user)
  tenantUsers!: TenantUser[];
}
