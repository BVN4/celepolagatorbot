import { Factory, FactoryMap } from '../System/Factory';
import { ObjectLiteral } from 'typeorm';
import { Config } from './Config';
import dotenv from 'dotenv';
import process from 'process';

export class ConfigFactory extends Factory {
	public init<I extends ObjectLiteral> (): FactoryMap<I> {
		this.map.set(Config, () => this.makeConfig());

		return this.map;
	}

	protected makeConfig (): Config {
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
}