import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import type { Request, Response } from 'express';
import type { JwtUsuario } from '../../modules/auth/dto/jwt-usuario';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtUsuario }>();
    const res = context.switchToHttp().getResponse<Response>();
    return next.handle().pipe(
      tap(() => {
        if (req.method !== 'GET' && res.statusCode < 400) {
          console.log(
            `[AUDIT] ${req.method} ${req.originalUrl} - Usuario: ${req.user?.id ?? 'anonymous'}`,
          );
        }
      }),
    );
  }
}
