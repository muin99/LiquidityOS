import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Reject any request body that has fields we didn't ask for,
  // and auto-convert types (e.g. "10" -> 10) based on our DTOs.
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  // Makes sure fields marked @Exclude() (like passwordHash) never leak out.
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Liquidity Lite API')
    .setDescription('Agent / coordinator / provider liquidity network')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`liquidity-lite running on http://localhost:${port}`);
  console.log(`API docs at http://localhost:${port}/docs`);
}
bootstrap();
