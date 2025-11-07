import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Optional: global prefix for all routes
  app.setGlobalPrefix('api');

  // Optional: enable CORS
  app.enableCors();

  await app.listen(3000);
  console.log(`Backend is running on http://localhost:3000`);
}

bootstrap();
