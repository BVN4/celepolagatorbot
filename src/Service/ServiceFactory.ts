import { ObjectLiteral } from 'typeorm';
import { Telegraf } from 'telegraf';
import { Factory, FactoryMap } from '../System/Factory';
import { BotContext, BotService } from './BotService';
import { System } from '../System/System';
import { GoalService } from './GoalService';
import { DB } from '../DB';
import { Goal } from '../Entity/Goal';
import { User } from '../Entity/User';
import { UserService } from './UserService';
import { QuestService } from './QuestService';
import { Quest } from '../Entity/Quest';

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
		this.map.set(QuestService, () => this.makeQuestService());
		this.map.set(UserService, () => this.makeUserService());

		return this.map;
	}

	protected makeBotService (): BotService
	{
		return new BotService(
			System.get(Telegraf<BotContext>)
		);
	}

	protected makeGoalService (): GoalService
	{
		return new GoalService(
			DB.getRepository(Goal)
		);
	}

	protected makeQuestService (): QuestService
	{
		return new QuestService(
			DB.getRepository(Quest)
		);
	}

	protected makeUserService (): UserService
	{
		return new UserService(
			DB.getRepository(User)
		);
	}
}