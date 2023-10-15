import { ObjectLiteral } from 'typeorm';
import { Telegraf } from 'telegraf';
import { Factory, FactoryMap } from '../System/Factory';
import { BotService } from './BotService';
import { System } from '../System/System';
import { GoalService } from './GoalService';
import { DB } from '../DB';
import { Goal } from '../Entity/Goal';
import { User } from '../Entity/User';

/**
 * Сервис - Domain Layer.
 * Рабочие лошадки, представляющие собой наборы методов-инструментов, выполняющие различные задачи.
 * Вообще-то, ответственности у сервисов должно быть по-больше, однако вся бизнес-логика уже в Controller.
 */
export class ServiceFactory extends Factory
{
	public init<I extends ObjectLiteral> (): FactoryMap<I>
	{
		this.map.set(BotService, () => this.makeBotService());
		this.map.set(GoalService, () => this.makeGoalService());

		return this.map;
	}

	protected makeBotService (): BotService
	{
		return new BotService(
			System.get(Telegraf)
		);
	}

	protected makeGoalService (): GoalService
	{
		return new GoalService(
			DB.getRepository(Goal),
			DB.getRepository(User)
		);
	}
}