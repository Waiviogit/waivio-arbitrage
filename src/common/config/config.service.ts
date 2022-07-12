import * as dotenv from 'dotenv';

dotenv.config({ path: `${process.env.NODE_ENV || 'development'}.env` });

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }
    return value;
  }

  public getMongoWaivioConnectionString(): string {
    const host = this.getValue('MONGO_HOST');
    const port = this.getValue('MONGO_PORT');
    const db = this.getValue('WAIVIO_DB');
    return `mongodb://${host}:${port}/${db}`;
  }

  public getPort(): string {
    return this.getValue('PORT', true);
  }

  getRedisConfig(): string {
    const host = this.getValue('REDIS_HOST');
    const port = this.getValue('REDIS_PORT');
    const db = this.getValue('REDIS_DB');

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
