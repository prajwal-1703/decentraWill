"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUser = exports.RequireStepUp = exports.REQUIRE_STEP_UP_KEY = exports.Roles = exports.ROLES_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.ROLES_KEY = 'roles';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;
exports.REQUIRE_STEP_UP_KEY = 'requireStepUp';
const RequireStepUp = () => (0, common_1.SetMetadata)(exports.REQUIRE_STEP_UP_KEY, true);
exports.RequireStepUp = RequireStepUp;
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
});
//# sourceMappingURL=decorators.js.map