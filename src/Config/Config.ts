import * as process from 'process';
import dotenv from 'dotenv';

export class Config {

	protected static instance: Config | null = null;

	protected constructor (
		protected token: string,
		protected hostDB: string = '',
		protected usernameDB: string = '',
		protected passwordDB: string = '',
		protected databaseDB: string = ''
	) {}

	protected static init (): Config {
		dotenv.config();

		if (!process.env.BOT_TOKEN) {
			throw new Error('Bot token not found from env');
		}

		return new Config(
			process.env.BOT_TOKEN.toString(),
			process.env.DB_HOST?.toString(),
			process.env.DB_USER?.toString(),
			process.env.DB_PASSWORD?.toString(),
			process.env.DB_DATABASE?.toString()
		);
	}

	public static getInstance (): Config {
		if (!this.instance) {
			this.instance = this.init();
		}

		return this.instance;
	}

	public getToken (): string {
		return this.token;
	}

	public getHostDB (): string {
		return this.hostDB;
	}

	public getUsernameDB (): string {
		return this.usernameDB;
	}

	public getPasswordDB (): string {
		return this.passwordDB;
	}

	public getDatabaseDB (): string {
		return this.databaseDB;
	}

}