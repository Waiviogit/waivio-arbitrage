import * as dotenv from 'dotenv';
import * as process from 'process';

dotenv.config();

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }
    return value;
  }

  public getMongoArbitrageConnectionString(): string {
    const host = this.getValue('MONGO_HOST');
    const port = this.getValue('MONGO_PORT');
    const db = this.getValue('ARBITRAGE_DB');

    const defaultConnectionString = `mongodb://${host}:${port}/${db}`;
    const connectionString = process.env.MONGO_URI_ARBITRAGE
      ? process.env.MONGO_URI_ARBITRAGE
      : defaultConnectionString;
    return connectionString;
  }

  public getPort(): string {
    return this.getValue('PORT', true);
  }

  getRedisConfig(db?: string): string {
    const host = this.getValue('REDIS_HOST');
    const port = this.getValue('REDIS_PORT');
    if (!db) db = this.getValue('REDIS_DB');

    return `redis://${host}:${port}/${db}`;
  }

  getWSUrl(): string {
    return this.getValue('WS_URL');
  }

  getApiKey(): string {
    return this.getValue('API_KEY');
  }
}

const configService = new ConfigService(process.env);

export { configService };
