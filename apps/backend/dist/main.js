"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Optional: global prefix for all routes
    app.setGlobalPrefix('api');
    // Optional: enable CORS
    app.enableCors();
    await app.listen(3000);
    console.log(`Backend is running on http://localhost:3000`);
}
bootstrap();
