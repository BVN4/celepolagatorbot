import { ObjectLiteral } from 'typeorm';
import { Telegraf } from 'telegraf';
import { Factory, FactoryMap } from '../System/Factory';
import { System } from '../System/System';
import { GoalView } from './GoalView';
import { BotContext } from '../Service/BotService';
import { Locale } from '../Locale/Locale';

export class ViewFactory extends Factory
{

	public init<I extends ObjectLiteral> (): FactoryMap<I> {
		this.map.set(GoalView, () => this.makeGoalView());

		return this.map;
	}

	protected makeGoalView (): GoalView {
		return new GoalView(
			System.get(Telegraf<BotContext>),
			System.get(Locale)
		);
	}

}