import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const originalJson = res.json.bind(res);
    res.json = function (body: any) {
      if (req.method !== 'GET' && res.statusCode < 400) {
        console.log(`[AUDIT] ${req.method} ${req.originalUrl} - Usuario: ${(req as any).user?.id || 'anonymous'}`);
      }
      return originalJson(body);
    };
    next();
  }
}