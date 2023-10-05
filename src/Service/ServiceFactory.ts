import { Factory, FactoryMap } from '../System/Factory';
import { ObjectLiteral } from 'typeorm';
import { BotSceneContext, ScenesService } from './ScenesService';
import { System } from '../System/System';
import { Telegraf } from 'telegraf';

export class ServiceFactory extends Factory {

	public init<I extends ObjectLiteral> (): FactoryMap<I> {
		this.map.set(ScenesService, () => this.makeScenesService());

		return this.map;
	}

	protected makeScenesService (): ScenesService {
		return new ScenesService(
			System.get(Telegraf<BotSceneContext>)
		);
	}

}