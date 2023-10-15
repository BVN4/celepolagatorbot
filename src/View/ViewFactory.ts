import { ObjectLiteral } from 'typeorm';
import { Telegraf } from 'telegraf';
import { Factory, FactoryMap } from '../System/Factory';
import { System } from '../System/System';
import { GoalView } from './GoalView';
import { BotContext } from '../Service/BotService';
import { Locale } from '../Locale/Locale';
import { MainView } from './MainView';

/**
 * View - содержит методы для вывода клиенту: отправка, редактирование сообщений и прочее.
 * До тех пор, пока Locale входит в зависимости только к View - этот мир идеален.
 */
export class ViewFactory extends Factory
{
	public init<I extends ObjectLiteral> (): FactoryMap<I>
	{
		this.map.set(GoalView, () => this.makeGoalView());
		this.map.set(MainView, () => this.makeMainView());

		return this.map;
	}

	protected makeGoalView (): GoalView
	{
		return new GoalView(
			System.get(Telegraf<BotContext>),
			System.get(Locale)
		);
	}

	protected makeMainView (): MainView
	{
		return new MainView(
			System.get(Locale)
		);
	}
}