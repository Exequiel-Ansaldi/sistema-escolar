import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    return next.handle().pipe(
      tap(() => {
        if (req.method !== 'GET' && req.res?.statusCode < 400) {
          console.log(`[AUDIT] ${req.method} ${req.originalUrl} - Usuario: ${(req as any).user?.id || 'anonymous'}`);
        }
      }),
    );
  }
}
