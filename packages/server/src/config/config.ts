class ConfigService {
  public get database() {
    return {
      client: process.env.DB_CLIENT || 'better-sqlite3',
      connection: process.env.DB_URL || ':memory:',
    };
  }
}

export { ConfigService };
