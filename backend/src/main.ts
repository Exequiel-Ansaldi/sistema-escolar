import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    });

    app.setGlobalPrefix('api');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Apagado ordenado (Unidad V clase 3): sin esto, SIGTERM corta
    // peticiones en curso en vez de drenarlas antes de cerrar.
    app.enableShutdownHooks();

    const port = process.env.PORT || 3000;
    console.log('Starting server on port', port);
    await app.listen(port, '0.0.0.0');
    console.log('Server running on port', port);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}
void bootstrap();
