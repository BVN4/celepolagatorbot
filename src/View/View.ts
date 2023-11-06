import { BotContext } from '../Service/BotService';
import { Markup, Telegraf } from 'telegraf';
import { Locale, ValueToPrepare } from '../Locale/Locale';

export class View
{
	public constructor (
		protected bot: Telegraf<BotContext>,
		protected locale: Locale
	)
	{}

	public async reply (ctx: BotContext, text: string): Promise<void>
	{
		await ctx.reply(
			this.locale.get(text),
			Markup.removeKeyboard()
		);
	}

	public async prepareReply (ctx: BotContext, text: string, values: ValueToPrepare = {}): Promise<void>
	{
		await ctx.reply(
			this.locale.prepare(text, values),
			Markup.removeKeyboard()
		);
	}

	public async notUnderstand (ctx: BotContext): Promise<void>
	{
		await ctx.reply(this.locale.get('NOT_UNDERSTAND'));
	}
}