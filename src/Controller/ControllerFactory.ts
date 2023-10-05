import { Factory, FactoryMap } from '../System/Factory';
import { ObjectLiteral } from 'typeorm';
import { MainController } from './MainController';
import { DB } from '../DB';
import { Goal } from '../Entity/Goal';
import { NewGoalController } from './NewGoalController';
import { Checkpoint } from '../Entity/Checkpoint';
import { System } from '../System/System';
import { BotSceneContext, ScenesService } from '../Service/ScenesService';
import { Telegraf } from 'telegraf';
import { Locale } from '../Locale/Locale';

export class ControllerFactory extends Factory {

	public init<I extends ObjectLiteral> (): FactoryMap<I> {
		this.map.set(MainController, () => this.makeMainController());
		this.map.set(NewGoalController, () => this.makeNewGoalController());

		return this.map;
	}

	protected makeMainController (): MainController {
		return new MainController(
			System.get(Telegraf),
			System.get(Locale),
			DB.getRepository(Goal)
		);
	}

	protected makeNewGoalController (): NewGoalController {
		return new NewGoalController(
			System.get(Telegraf<BotSceneContext>),
			System.get(Locale),
			System.get(ScenesService),
			DB.getRepository(Goal),
			DB.getRepository(Checkpoint)
		);
	}

}