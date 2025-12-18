/* eslint-disable */
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { Repository } from 'typeorm';
import { EmailService } from '../email/email.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  getFrontendUrl(): string {
    return this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    return user;
  }

  async login(user: any) {
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      // 1. Verify refresh token
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // 2. Get user and verify refresh token
      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
        select: ['id', 'email', 'refreshToken', 'refreshTokenExpires'],
      });

      if (
        !user ||
        !user.refreshToken ||
        user.refreshToken !== refreshTokenDto.refreshToken
      ) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // 3. Check if refresh token is expired
      if (user.refreshTokenExpires && new Date() > user.refreshTokenExpires) {
        throw new UnauthorizedException('Refresh token expired');
      }

      // 4. Generate new tokens
      const tokens = await this.getTokens(user.id, user.email);

      // 5. Update refresh token in database
      await this.updateRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      // Invalidate refresh token if verification fails
      if (
        error.name === 'TokenExpiredError' ||
        error.name === 'JsonWebTokenError'
      ) {
        const payload = this.jwtService.decode(refreshTokenDto.refreshToken);
        if (payload && payload.sub) {
          await this.updateRefreshToken(payload.sub, undefined);
        }
        throw new UnauthorizedException('Invalid or expired refresh token');
      }
      throw error;
    }
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationTokenExpires,
    });

    // Send verification email
    await this.emailService.sendVerificationEmail(
      user.email,
      verificationToken,
    );

    return {
      message:
        'Registration successful. Please check your email to verify your account.',
    };
  }

  async logout(userId: string) {
    await this.updateRefreshToken(userId, undefined);
    return { message: 'Logged out successfully' };
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal that the email doesn't exist
      return {
        message:
          'If your email exists in our system, you will receive a password reset link',
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    await this.usersService.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetTokenExpires,
    });

    await this.emailService.sendPasswordResetEmail(
      user.email,
      user.name,
      resetToken,
    );

    return { message: 'Password reset link sent to your email' };
  }

  async changePassword(email: string, token: string, newPassword: string) {
    const user = await this.usersService.findByEmail(email);

    if (
      !user ||
      !user.passwordResetToken ||
      user.passwordResetToken !== token ||
      !user.passwordResetExpires ||
      user.passwordResetExpires < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.usersService.update(user.id, {
      password: hashedPassword,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
    });

    return { message: 'Password updated successfully' };
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findByVerificationToken(token);

    if (!user) {
      throw new UnauthorizedException('Invalid verification token');
    }

    if (
      user.emailVerificationExpires &&
      user.emailVerificationExpires < new Date()
    ) {
      throw new UnauthorizedException('Verification token has expired');
    }

    await this.usersService.update(user.id, {
      isEmailVerified: true,
      emailVerificationToken: undefined,
      emailVerificationExpires: undefined,
    });

    return { message: 'Email verified successfully' };
  }

  private async getTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.configService.get('JWT_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async updateRefreshToken(
    userId: string,
    refreshToken: string | undefined,
  ) {
    const data: Partial<User> = {
      refreshToken: refreshToken || undefined,
      refreshTokenExpires: refreshToken
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        : undefined,
    };

    await this.usersRepository.update(userId, data);
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { emailVerificationToken: token },
    });
  }

  async verifyPasswordResetOtp(email: string, otp: string) {
    // Implement your OTP verification logic here
    // This is a placeholder - replace with your actual OTP verification
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return { isValid: true };
    }

    // Add your actual OTP verification logic here
    // For now, we'll just return true if the OTP is not empty
    return {
      isValid: !!otp,
      token: otp, // In a real app, this would be a JWT or similar
    };
  }
}
