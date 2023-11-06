import { Markup } from 'telegraf';
import { BotContext } from '../Service/BotService';
import { Goal } from '../Entity/Goal';
import { ButtonEnum } from '../Enum/ButtonEnum';
import { Quest } from '../Entity/Quest';
import { View } from './View';

export class MainView extends View
{
	public async startMessage (
		ctx: BotContext,
		isAction: boolean = false,
		nextGoal: Goal | null,
		nextQuest: Quest | null
	): Promise<void> {
		let text = this.locale.get('START') + '\n\n';
		let buttons = [];

		if (nextGoal) {
			text += this.locale.prepare('YOU_MOVING_TOWARDS_GOAL', {
				goal: nextGoal?.name ?? '',
				target: nextQuest?.name ?? ''
			});
			text += this.locale.get('START_MENU');
			text += this.locale.get('START_COMMAND_GOALS');
			if (nextQuest) {
				text += this.locale.get('START_COMMAND_DONE');
			}
			buttons.push(Markup.button.callback(this.locale.get(ButtonEnum.FORGET_GOAL), ButtonEnum.FORGET_GOAL));
		} else {
			text = this.locale.get('START');
			buttons.push(Markup.button.callback(this.locale.get(ButtonEnum.NEW), ButtonEnum.NEW));
		}

		const keyboard = Markup.inlineKeyboard([buttons]);

		if (isAction) {
			await ctx.editMessageText(text, keyboard);
		} else {
			await ctx.reply(text, keyboard);
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