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

	public askYouWatched (ctx: BotContext): void
	{
		ctx.reply(
			this.locale.get('YOU_WATCHED'),
			Markup.keyboard([this.locale.get('YES_WATCHED')])
				.oneTime()
				.resize()
		).catch(console.error);
	}

	public askQuestion (ctx: BotContext, index: number, target: string): void
	{
		ctx.reply(
			this.locale.prepare('QUESTION', {
				timeName: GoalController.questions[index].name,
				target: target
			})
		).catch(console.error);
	}

	public askTodayQuestion (userId: number, target: string): void
	{
		this.bot.telegram.sendMessage(
			userId,
			this.locale.prepare('TODAY_QUESTION', {
				target: target
			})
		).catch(console.error);
	}

	public askResultQuestion (userId: number, target: string): void
	{
		this.bot.telegram.sendMessage(
			userId,
			this.locale.prepare('RESULT_QUESTION', {
				target: target
			}),
			Markup.keyboard([this.locale.get('YES_SUCCESS'), this.locale.get('NO_FAILED')])
				.oneTime()
				.resize()
		).catch(console.error);
	}

	public forgotten (ctx: BotContext): void
	{
		const text = this.locale.get('FORGOTTEN');
		const keyboard = Markup.inlineKeyboard([
			Markup.button.callback(this.locale.get(ButtonEnum.START), ButtonEnum.START)
		]);

		ctx.editMessageText(text, keyboard).catch(console.error);
	}

	public reply (ctx: BotContext, text: string): void
	{
		ctx.reply(this.locale.get(text))
			.catch(console.error);
	}

	public congratulateComplete (ctx: BotContext, goalName: string): void
	{
		ctx.reply(
			this.locale.prepare('CONGRATULATE_COMPLETE', {
				goal: goalName
			}),
			Markup.removeKeyboard()
		).catch(console.error);
	}

	public noMoreGoals (ctx: BotContext): void
	{
		const text = this.locale.get('NO_MORE_GOALS');
		const keyboard = Markup.inlineKeyboard([
			Markup.button.callback(this.locale.get(ButtonEnum.START), ButtonEnum.START)
		]);

		ctx.reply(text, keyboard).catch(console.error);
	}
}