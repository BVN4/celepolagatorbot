import { Markup } from 'telegraf';
import { BotContext } from '../Service/BotService';
import { Locale } from '../Locale/Locale';
import { Goal } from '../Entity/Goal';
import { ButtonEnum } from '../Enum/ButtonEnum';

export class MainView
{
	public constructor (
		protected locale: Locale
	)
	{}

	public startMessage (
		ctx: BotContext,
		isAction: boolean = false,
		goals: Goal[]
	): void {
		let text = '';
		let buttons = [];

		if (goals.length) {
			let mainGoal: Goal | null = null;
			let target: Goal | null = null;

			for (const goal of goals) {
				if (goal.timestamp == 0) {
					mainGoal = goal;
					continue;
				}
				if (!target || target.timestamp > goal.timestamp) {
					target = goal;
				}
			}

			text = this.locale.get('START') + '\n\n';
			text += this.locale.prepare('YOU_MOVING_TOWARDS_GOAL', {
				goal: mainGoal?.name ?? '',
				target: target?.name ?? ''
			});
			buttons.push(Markup.button.callback(this.locale.get(ButtonEnum.FORGET_GOAL), ButtonEnum.FORGET_GOAL));
		} else {
			text = this.locale.get('START');
			buttons.push(Markup.button.callback(this.locale.get(ButtonEnum.NEW), ButtonEnum.NEW));
		}

		const keyboard = Markup.inlineKeyboard([buttons]);

		if (isAction) {
			ctx.editMessageText(text, keyboard).catch(console.error);
		} else {
			ctx.reply(text, keyboard).catch(console.error);
		}
	}

	public confirmForget (ctx: BotContext): void
	{
		const text = this.locale.get('FORGET_CONFIRM');
		const keyboard = Markup.inlineKeyboard([
			Markup.button.callback(this.locale.get(ButtonEnum.FORGET_CONFIRM), ButtonEnum.FORGET_CONFIRM),
			Markup.button.callback(this.locale.get('BUTTON_FORGET_BACK'), ButtonEnum.START)
		]);

		ctx.editMessageText(text, keyboard).catch(console.error);
	}
}