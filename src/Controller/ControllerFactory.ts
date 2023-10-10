import { Factory, FactoryMap } from '../System/Factory';
import { ObjectLiteral } from 'typeorm';
import { MainController } from './MainController';
import { DB } from '../DB';
import { Goal } from '../Entity/Goal';
import { GoalController } from './GoalController';
import { System } from '../System/System';
import { Telegraf } from 'telegraf';
import { Locale } from '../Locale/Locale';
import { BotContext } from '../System/Bot';

export class ControllerFactory extends Factory {

	public init<I extends ObjectLiteral> (): FactoryMap<I> {
		this.map.set(MainController, () => this.makeDefaultController());
		this.map.set(GoalController, () => this.makeDefaultController());

		return this.map;
	}

	protected makeDefaultController (): MainController {
		return new MainController(
			System.get(Telegraf<BotContext>),
			System.get(Locale),
			DB.getRepository(Goal)
		);
	}

}