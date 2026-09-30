import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { RoleType } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleType[]) => SetMetadata(ROLES_KEY, roles);

export const REQUIRE_STEP_UP_KEY = 'requireStepUp';
export const RequireStepUp = () => SetMetadata(REQUIRE_STEP_UP_KEY, true);

export const CurrentUser = createParamDecorator((data: string | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;
  return data ? user?.[data] : user;
});
