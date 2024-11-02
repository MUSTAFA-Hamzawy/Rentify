import * as jwt from 'jsonwebtoken';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import { TokenBlackList } from '../users/entities/token-blacklist.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(TokenBlackList)
    private readonly tokenBlackListRepository: Repository<TokenBlackList>,
  ) {}

  /**
   * This method checks if the request can proceed based on authentication.
   * It first checks if the route is public, then verifies the token if present.
   * If the token is valid and not blacklisted, it attaches user info to the request.
   *
   * @param context ExecutionContext of the request
   * @returns Promise<boolean> indicating if the request can proceed
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublicRoute: boolean = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublicRoute) return true; // If the route is public, allow the request to proceed

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer')) {
      const token = authHeader.split(' ')[1]; // Extracting the token from the Authorization header

      // Attempting to verify the token
      try {
        // Checking if the token is in the blacklist
        const expiredToken = await this.tokenBlackListRepository.findOneBy({
          token,
        });

        if (expiredToken) {
          throw new UnauthorizedException(
            'Your session is expired, Kindly login again.',
          );
        }

        // Verifying the token using the JWT secret key
        const decodedData = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_KEY);

        request.user = decodedData; // Attach user info to request
        return true; // Allow the request to proceed
      } catch (err) {
        throw new UnauthorizedException(err.message);
      }
    }
    throw new UnauthorizedException('This user is not authenticated.');
  }
}
