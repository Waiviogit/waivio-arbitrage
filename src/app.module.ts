import { Module } from '@nestjs/common';
import { EngineModule } from './services/hive-engine-api/engine.module';

@Module({
  imports: [EngineModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
