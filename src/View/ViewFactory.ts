import { ObjectLiteral } from 'typeorm';
import { Telegraf } from 'telegraf';
import { Factory, FactoryMap } from '../System/Factory';
import { System } from '../System/System';
import { GoalView } from './GoalView';
import { BotContext } from '../Service/BotService';
import { Locale } from '../Locale/Locale';
import { MainView } from './MainView';
import { QuestView } from './QuestView';
import { View } from './View';

/**
 * View - содержит методы для вывода клиенту: отправка, редактирование сообщений и прочее.
 * До тех пор, пока Locale входит в зависимости только к View - этот мир идеален.
 */
export class ViewFactory extends Factory
{
	public init<I extends ObjectLiteral> (): FactoryMap<I>
	{
		this.map.set(GoalView, () => this.makeView(GoalView));
		this.map.set(MainView, () => this.makeView(MainView));
		this.map.set(QuestView, () => this.makeView(QuestView));

		return this.map;
	}

	protected makeView<I extends View> (c: new (...args: any) => I): I
	{
		return new c(
			System.get(Telegraf<BotContext>),
			System.get(Locale)
		);
	}
}