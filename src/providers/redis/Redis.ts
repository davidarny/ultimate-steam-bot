import redis from 'redis';

export class Redis {
  public static getInstance(): Redis {
    if (!Redis.instance) {
      Redis.instance = new Redis();
    }
    return Redis.instance;
  }

  private static instance: Redis;

  private readonly client = redis.createClient();

  private constructor() {}

  public get(key: string, cb?: redis.Callback<string>): boolean {
    return this.client.get(key, cb);
  }

  public set(key: string, value: string, cb?: redis.Callback<'OK'>): boolean {
    return this.client.set(key, value, cb);
  }

  public async flush(): Promise<void> {
    return new Promise(resolve => this.client.flushdb(() => resolve()));
  }
}
