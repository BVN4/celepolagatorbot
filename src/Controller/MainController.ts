import { Telegraf } from 'telegraf';
import { ButtonEnum } from '../Enum/ButtonEnum';
import { BotContext } from '../Service/BotService';
import { MainView } from '../View/MainView';
import { GoalService } from '../Service/GoalService';
import { QuestService } from '../Service/QuestService';

export class MainController
{
	public constructor (
		protected bot: Telegraf<BotContext>,
		protected goalService: GoalService,
		protected questService: QuestService,
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

		delete ctx.session.state;
		delete ctx.session.waitAnswer;

		if (!ctx.from?.id) {
			return;
		}

		const nextGoal = await this.goalService.getNextGoal(ctx.from.id);
		const nextQuest = await this.questService.getNextQuest(ctx.from.id);

		ctx.logger.info('Send message');

		await this.mainView.startMessage(ctx, isAction, nextGoal, nextQuest);

		ctx.logger.info('Message sent');
	}
}