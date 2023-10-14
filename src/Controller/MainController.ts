import { Markup, Telegraf } from 'telegraf';
import { ButtonEnum } from '../Enum/ButtonEnum';
import { Repository } from 'typeorm/repository/Repository';
import { Locale } from '../Locale/Locale';
import { BotContext } from '../Service/BotService';
import { Goal } from '../Entity/Goal';
import { GoalStatusEnum } from '../Enum/GoalStatusEnum';

export class MainController {

	public constructor (
		protected bot: Telegraf<BotContext>,
		protected locale: Locale,
		protected goalRepository: Repository<Goal>
	) {}

	public init (): void {
		this.bot.start((ctx) => this.handleStart(ctx));
		this.bot.action(ButtonEnum.START, (ctx) => this.handleStart(ctx, true));
		this.bot.action(ButtonEnum.FORGET_GOAL, (ctx) => this.handleConfirmForget(ctx));
	}

	protected async handleStart (
		ctx: BotContext,
		isAction: boolean = false
	): Promise<void> {
		ctx.session.state = null;

		if (!ctx.from?.id) {
			return;
		}

		let text = '';
		let buttons = [];

		const goals = await this.goalRepository.find({
			where: {
				status: GoalStatusEnum.WAIT,
				userId: ctx.from?.id
			},
			order: {
				timestamp: 'ASC'
			}
		});

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
			ctx.editMessageText(text, keyboard).then().catch(console.error);
		} else {
			ctx.reply(text, keyboard).then().catch(console.error);
		}
	}

	protected async handleConfirmForget (
		ctx: BotContext
	): Promise<void> {
		const text = this.locale.get('FORGET_CONFIRM');
		const keyboard = Markup.inlineKeyboard([
			Markup.button.callback(this.locale.get(ButtonEnum.FORGET_CONFIRM), ButtonEnum.FORGET_CONFIRM),
			Markup.button.callback(this.locale.get('BUTTON_FORGET_BACK'), ButtonEnum.START)
		]);

		ctx.editMessageText(text, keyboard).then().catch(console.error);
	}
}