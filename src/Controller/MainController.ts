import { Telegraf } from 'telegraf';
import { ButtonEnum } from '../Enum/ButtonEnum';
import { BotContext } from '../Service/BotService';
import { MainView } from '../View/MainView';
import { GoalService } from '../Service/GoalService';

export class MainController
{
	public constructor (
		protected bot: Telegraf<BotContext>,
		protected goalService: GoalService,
		protected mainView: MainView
	)
	{}

	public init (): void
	{
		this.bot.start((ctx) => this.handleStart(ctx));

		this.bot.action(ButtonEnum.START, (ctx) => this.handleStart(ctx, true));
		this.bot.action(ButtonEnum.FORGET_GOAL, (ctx) => this.mainView.confirmForget(ctx));
	}

	protected async handleStart (ctx: BotContext, isAction: boolean = false): Promise<void>
	{
		ctx.logger.info('Main handleStart');

		ctx.session.state = null;
		ctx.session.waitAnswer = null;

		if (!ctx.from?.id) {
			return;
		}

		const goals = await this.goalService.getGoalsByUser(ctx.from.id);

		ctx.logger.info('Send message');

		await this.mainView.startMessage(ctx, isAction, goals);

		ctx.logger.info('Message sent');
	}
}