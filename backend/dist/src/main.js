"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const http_exception_filter_1 = require("./common/http-exception.filter");
const uuid_1 = require("uuid");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: process.env.CORS_ORIGIN || '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.use((req, res, next) => {
        const correlationId = req.headers['x-correlation-id'] || `req_${(0, uuid_1.v4)().replace(/-/g, '').slice(0, 16)}`;
        req.headers['x-correlation-id'] = correlationId;
        res.setHeader('x-correlation-id', correlationId);
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        next();
    });
    app.useGlobalFilters(new http_exception_filter_1.GlobalHttpExceptionFilter());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidUnknownValues: false,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('DecentraWill API')
        .setDescription('Secure digital trust, verification, asset-management, governance, and inheritance-coordination platform backend.')
        .setVersion('1.0.0')
        .addBearerAuth()
        .addTag('Authentication')
        .addTag('Identity / KYC')
        .addTag('Estates')
        .addTag('Wills')
        .addTag('Document Vault')
        .addTag('Attestations')
        .addTag('Assets')
        .addTag('Workflows')
        .addTag('Governance & Voting')
        .addTag('Proof of Life')
        .addTag('Inheritance & Activation')
        .addTag('Notifications')
        .addTag('Admin & Operations')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = parseInt(process.env.PORT || '4000', 10);
    await app.listen(port);
    logger.log(`DecentraWill API server is running on http://localhost:${port}`);
    logger.log(`OpenAPI documentation available at http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map