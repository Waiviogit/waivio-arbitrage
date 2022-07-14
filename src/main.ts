import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { configService } from './common/config';
import { BlockProcessor } from './processor/block-processor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.setGlobalPrefix('arbitrage');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      stopAtFirstError: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Arbitrage service')
    .setDescription('Arbitrage service')
    .setVersion('1.0')
    .addTag('arbitrage')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('arbitrage/docs', app, document);
  await app.listen(configService.getPort());

  const blockProcessor = app.get(BlockProcessor);
  blockProcessor.start();
}
bootstrap();
