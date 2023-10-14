import { Factory, FactoryMap } from '../System/Factory';
import { ObjectLiteral } from 'typeorm';
import { MainController } from './MainController';
import { DB } from '../DB';
import { Goal } from '../Entity/Goal';
import { GoalController } from './GoalController';
import { System } from '../System/System';
import { Telegraf } from 'telegraf';
import { Locale } from '../Locale/Locale';
import { BotContext, BotService } from '../Service/BotService';
import { User } from '../Entity/User';

export class ControllerFactory extends Factory {

	public init<I extends ObjectLiteral> (): FactoryMap<I> {
		this.map.set(MainController, () => this.makeMainController());
		this.map.set(GoalController, () => this.makeGoalController());

		return this.map;
	}

	protected makeMainController (): MainController {
		return new MainController(
			System.get(Telegraf<BotContext>),
			System.get(Locale),
			DB.getRepository(Goal)
		);
	}

	protected makeGoalController (): GoalController {
		return new GoalController(
			System.get(Telegraf<BotContext>),
			System.get(Locale),
			DB.getRepository(Goal),
			DB.getRepository(User),
			System.get(BotService)
		);
	}

}