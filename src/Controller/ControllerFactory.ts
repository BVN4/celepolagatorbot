import { Factory, FactoryMap } from '../System/Factory';
import { ObjectLiteral } from 'typeorm';
import { MainController } from './MainController';
import { GoalController } from './GoalController';
import { System } from '../System/System';
import { Telegraf } from 'telegraf';
import { BotContext, BotService } from '../Service/BotService';
import { GoalService } from '../Service/GoalService';
import { GoalView } from '../View/GoalView';
import { MainView } from '../View/MainView';

/**
 * Контроллеры - Application Layer или Controller из MVC.
 * Тут определяется основная бизнес-логика.
 * Контроллер должен взаимодействовать напрямую только с View и Service.
 */
export class ControllerFactory extends Factory
{
	public init<I extends ObjectLiteral> (): FactoryMap<I>
	{
		this.map.set(MainController, () => this.makeMainController());
		this.map.set(GoalController, () => this.makeGoalController());

		return this.map;
	}

	protected makeMainController (): MainController
	{
		return new MainController(
			System.get(Telegraf<BotContext>),
			System.get(GoalService),
			System.get(MainView)
		);
	}

	protected makeGoalController (): GoalController
	{
		return new GoalController(
			System.get(Telegraf<BotContext>),
			System.get(BotService),
			System.get(GoalService),
			System.get(GoalView)
		);
	}
}