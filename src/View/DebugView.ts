import { View } from './View';
import { BotContext } from '../Service/BotService';

export class DebugView extends View
{
	public async askUseId (ctx: BotContext): Promise<void>
	{
		await ctx.reply(this.locale.get('GET_USER_ID'));
	}

	public async dumpData (ctx: BotContext, data: string): Promise<void>
	{
		await ctx.reply('```\n' + data + '\n```');
	}
}