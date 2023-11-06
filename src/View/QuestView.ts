import { View } from './View';
import { Markup } from 'telegraf';
import { BotContext } from '../Service/BotService';

export class QuestView extends View
{
	public async askResultQuestion (userId: number, target: string): Promise<void>
	{
		await this.bot.telegram.sendMessage(
			userId,
			this.locale.prepare('RESULT_QUESTION', {
				target: target
			}),
			Markup.keyboard([this.locale.get('YES_SUCCESS'), this.locale.get('NO_FAILED')])
				.oneTime()
				.resize()
		);
	}

	public async askWhatsNextQuestion (ctx: BotContext): Promise<void>
	{
		const text = this.locale.get('QUEST_FAILED');
		const keyboard = Markup.keyboard([this.locale.get('QUEST_AGAIN'), this.locale.get('QUEST_NEW')])
			.oneTime()
			.resize();

		await ctx.reply(text, keyboard);
	}

	public async askTodayQuestion (userId: number, target: string, title: string = ''): Promise<void>
	{
		if (title) {
			title = this.locale.get(title) + '\n\n';
		}

		await this.bot.telegram.sendMessage(
			userId,
			title + this.locale.prepare('TODAY_QUESTION', {
				target: target
			}),
			Markup.removeKeyboard()
		);
	}
}