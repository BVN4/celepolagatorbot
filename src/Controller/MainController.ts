import { Context, Markup, Telegraf } from 'telegraf';
import { ButtonEnum } from '../Enum/ButtonEnum';
import { Repository } from 'typeorm/repository/Repository';
import { Goal } from '../Entity/Goal';
import { InlineKeyboardMarkup } from '@telegraf/types/markup';
import { Locale } from '../Locale/Locale';

export class MainController {

	public constructor (
		protected bot: Telegraf,
		protected locale: Locale,
		protected goalRepository: Repository<Goal>
	) {}

	public initListeners (): void {
		this.bot.start((ctx) => this.handleStart(ctx));
		this.bot.action(ButtonEnum.START, (ctx) => this.handleActionStart(ctx));
	}

	protected async handleStart (ctx: Context): Promise<void> {
		ctx.reply(
			this.locale.get('START'),
			await this.getKeyboard(ctx)
		).then();
	}

	protected async handleActionStart (ctx: Context): Promise<void> {
		ctx.editMessageCaption(
			this.locale.get('START'),
			await this.getKeyboard(ctx)
		).then();
	}

	protected async getKeyboard (ctx: Context): Promise<Markup.Markup<InlineKeyboardMarkup>> {
		const countGoals = ctx.from?.id
			? await this.goalRepository.countBy({ user: ctx.from.id })
			: 0;

		const keyboard = [];

		if (countGoals > 0) {
			keyboard.push(Markup.button.callback(this.locale.get(ButtonEnum.NEXT), ButtonEnum.NEXT));
			keyboard.push(Markup.button.callback(this.locale.get(ButtonEnum.LIST), ButtonEnum.LIST));
		}

		keyboard.push(Markup.button.callback(this.locale.get(ButtonEnum.NEW), ButtonEnum.NEW));

		return Markup.inlineKeyboard([keyboard]);
	}

}