import { Factory, FactoryMap } from './Factory';
import { ObjectLiteral } from 'typeorm';
import { Telegraf } from 'telegraf';
import { System } from './System';
import { Config } from '../Config/Config';

export class SystemFactory extends Factory {

	public init<I extends ObjectLiteral> (): FactoryMap<I> {
		this.map.set(Telegraf, () => this.makeTelegraf());

		return this.map;
	}

	protected makeTelegraf (): Telegraf {
		return new Telegraf(
			System.get(Config).getToken()
		);
	}

}