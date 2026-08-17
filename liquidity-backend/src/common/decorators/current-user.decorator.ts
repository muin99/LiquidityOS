import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// This lets us write @CurrentUser() in a controller to grab
// "whoever is logged in right now", instead of digging through the request.
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
