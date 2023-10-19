import { Markup, Telegraf } from 'telegraf';
import { ButtonEnum } from '../Enum/ButtonEnum';
import { BotContext } from '../Service/BotService';
import { Locale } from '../Locale/Locale';
import { GoalController } from '../Controller/GoalController';

export class GoalView
{
	protected static readonly VIDEO_URL = 'https://youtu.be/0IgDIxow7T4?si=X85FmazZYqrkrTl4';

	public constructor (
		protected bot: Telegraf<BotContext>,
		protected locale: Locale
	)
	{}

	public async watchVideo (ctx: BotContext): Promise<void>
	{
		await ctx.editMessageText(
			this.locale.get('WATCH_VIDEO'),
			Markup.inlineKeyboard([
				Markup.button.url(this.locale.get(ButtonEnum.VIDEO_URL), GoalView.VIDEO_URL)
			])
		);
	}

	public async askYouWatched (ctx: BotContext): Promise<void>
	{
		await ctx.reply(
			this.locale.get('YOU_WATCHED'),
			Markup.keyboard([this.locale.get('YES_WATCHED')])
				.oneTime()
				.resize()
		).catch(console.error);
	}

	public async askQuestion (ctx: BotContext, index: number, target: string): Promise<void>
	{
		await ctx.reply(
			this.locale.prepare('QUESTION', {
				timeName: GoalController.questions[index].name,
				target: target
			})
		);
	}

	public async askTodayQuestion (userId: number, target: string): Promise<void>
	{
		await this.bot.telegram.sendMessage(
			userId,
			this.locale.prepare('TODAY_QUESTION', {
				target: target
			})
		);
	}

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

	public async forgotten (ctx: BotContext): Promise<void>
	{
		const text = this.locale.get('FORGOTTEN');
		const keyboard = Markup.inlineKeyboard([
			Markup.button.callback(this.locale.get(ButtonEnum.START), ButtonEnum.START)
		]);

		await ctx.editMessageText(text, keyboard);
	}

	public async reply (ctx: BotContext, text: string): Promise<void>
	{
		await ctx.reply(this.locale.get(text));
	}

	public async congratulateComplete (ctx: BotContext, goalName: string): Promise<void>
	{
		await ctx.reply(
			this.locale.prepare('CONGRATULATE_COMPLETE', {
				goal: goalName
			}),
			Markup.removeKeyboard()
		);
	}

	public async noMoreGoals (ctx: BotContext): Promise<void>
	{
		const text = this.locale.get('NO_MORE_GOALS');
		const keyboard = Markup.inlineKeyboard([
			Markup.button.callback(this.locale.get(ButtonEnum.START), ButtonEnum.START)
		]);

		await ctx.reply(text, keyboard);
	}
}