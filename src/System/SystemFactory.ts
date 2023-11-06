import { Factory, FactoryMap } from './Factory';
import { ObjectLiteral } from 'typeorm';
import { Telegraf } from 'telegraf';
import { System } from './System';
import { Config } from '../Config/Config';
import { Logger } from './Logger';
import { Router } from './Router';
import { BotContext } from '../Service/BotService';
import { GoalController } from '../Controller/GoalController';
import { MainController } from '../Controller/MainController';
import { QuestController } from '../Controller/QuestController';

export class SystemFactory extends Factory
{
	public init<I extends ObjectLiteral> (): FactoryMap<I>
	{
		this.map.set(Telegraf, () => this.makeTelegraf());
		this.map.set(Router, () => this.makeRouter());
		this.map.set(Logger, () => new Logger());

		return this.map;
	}

	protected makeTelegraf (): Telegraf
	{
		return new Telegraf(
			System.get(Config).getToken()
		);
	}

	protected makeRouter (): Router
	{
		return new Router(
			System.get(Telegraf<BotContext>),
			System.get(GoalController),
			System.get(MainController),
			System.get(QuestController),
		);
	}
}