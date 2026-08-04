import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtUsuario } from '../../modules/auth/dto/jwt-usuario';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtUsuario | undefined, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: JwtUsuario }>();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
