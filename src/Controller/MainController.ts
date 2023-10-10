import { Markup, Telegraf } from 'telegraf';
import { ButtonEnum } from '../Enum/ButtonEnum';
import { Repository } from 'typeorm/repository/Repository';
import { Goal } from '../Entity/Goal';
import { Locale } from '../Locale/Locale';
import { BotContext } from '../System/Bot';

export class MainController {

	public constructor (
		protected bot: Telegraf<BotContext>,
		protected locale: Locale,
		protected goalRepository: Repository<Goal>
	) {}

	public initListeners (): void {
		this.bot.start((ctx) => this.handleStart(ctx));
		this.bot.action(ButtonEnum.START, (ctx) => this.handleStart(ctx, true));
	}

	protected async handleStart (
		ctx: BotContext,
		isAction: boolean = false
	): Promise<void> {
		delete ctx.session.state;

		let text = '';
		let buttons = [];

		const countGoals = ctx.from?.id
			? await this.goalRepository.countBy({ user: ctx.from.id })
			: 0;

		if (countGoals > 0) {
			// keyboard.push(Markup.button.callback(this.locale.get(ButtonEnum.NEW), ButtonEnum.NEW));
		} else {
			text = this.locale.get('START');
			buttons.push(Markup.button.callback(this.locale.get(ButtonEnum.NEW), ButtonEnum.NEW));
		}

		const keyboard = Markup.inlineKeyboard([buttons]);

		if (isAction) {
			ctx.editMessageText(text, keyboard).then().catch(console.error);
		} else {
			ctx.reply(text, keyboard).then().catch(console.error);
		}
	}
}