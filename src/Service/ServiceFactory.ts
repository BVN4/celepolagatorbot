import { ObjectLiteral } from 'typeorm';
import { Telegraf } from 'telegraf';
import { Factory, FactoryMap } from '../System/Factory';
import { BotService } from './BotService';
import { System } from '../System/System';

export class ServiceFactory extends Factory {

	public init<I extends ObjectLiteral> (): FactoryMap<I> {
		this.map.set(BotService, () => this.makeBotService());

		return this.map;
	}

	protected makeBotService (): BotService {
		return new BotService(
			System.get(Telegraf)
		);
	}

}