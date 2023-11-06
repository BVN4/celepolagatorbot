import { BotContext } from '../Service/BotService';
import { Markup, Telegraf } from 'telegraf';
import { Locale } from '../Locale/Locale';

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
}