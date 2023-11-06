import { deunionize, Telegraf } from 'telegraf';
import { ButtonEnum } from '../Enum/ButtonEnum';
import { BotContext } from '../Service/BotService';
import { GoalView } from '../View/GoalView';
import { GoalService } from '../Service/GoalService';
import { WaitAnswerEnum } from '../Enum/WaitAnswerEnum';
import { GoalsDecMap } from '../ValueObject/GoalsDec';
import { BotStateEnum } from '../Enum/BotStateEnum';
import { UserService } from '../Service/UserService';
import { CommandEnum } from '../Enum/CommandEnum';

export class GoalController
{
	protected readonly percents = [100, 75, 50, 25, 1];
	protected readonly decompositionScript = [100, 50, 75, 25, 1];

	public constructor (
		protected bot: Telegraf<BotContext>,
		protected goalService: GoalService,
		protected userService: UserService,
		protected goalView: GoalView
	)
	{}

	public init (): void
	{
		this.bot.action(ButtonEnum.NEW, (ctx) => this.handleEnter(ctx));
		this.bot.action(ButtonEnum.FORGET_CONFIRM, (ctx) => this.handleForget(ctx));

		this.bot.command(CommandEnum.GOALS, (ctx) => this.handleShowGoalsDec(ctx));
	}

	protected async handleEnter (ctx: BotContext): Promise<void>
	{
		ctx.logger.info('Goal handleEnter');

		ctx.session.state = BotStateEnum.GOAL;
		ctx.session.waitAnswer = WaitAnswerEnum.REGISTRATION;

		ctx.session.goalsDec = new GoalsDecMap();

		await this.goalView.reply(ctx, 'LETS_START');
		await this.goalView.showPathToGoalPic(ctx);
		await this.handleGoalsDec(ctx);
	}

	public async handleMessage (ctx: BotContext): Promise<void>
	{
		if (!ctx.message || !ctx.from?.id) {
			return;
		}

		const message = deunionize(ctx.message);
		const text = message.text ?? '';

		if (!text) {
			ctx.logger.info('Text empty');
			return;
		}

		if (ctx.session.waitAnswer === WaitAnswerEnum.REGISTRATION) {
			if (text.length > 255) {
				await this.goalView.reply(ctx, 'ERROR_VERY_LONG_GOAL');
				ctx.logger.warn('Very long message');
				return;
			}

			if (await this.handleGoalsDec(ctx, text)) {
				return;
			}

			if (!ctx.session.goalsDec) {
				ctx.logger.error('Empty goalsDec');
				return;
			}

			await this.userService.softCreateUser(ctx.from.id);

			await this.goalService.insertGoals(ctx.session.goalsDec, ctx.from.id);

			await this.goalView.showGoalsDec(
				ctx,
				ctx.session.goalsDec,
				this.percents,
				'GOAL_DEC_TITLE_FINAL',
				'TODAY_QUESTION',
				text
			);

			ctx.session.goalsDec = new GoalsDecMap();

			ctx.session.waitAnswer = WaitAnswerEnum.TODAY_QUESTION;
			ctx.session.state = BotStateEnum.QUEST;
			return;
		}
	}

	protected async handleForget (ctx: BotContext): Promise<void>
	{
		if (!ctx.from?.id) {
			return;
		}

		ctx.logger.info('Goal handleForget');

		await this.goalService.forgetGoals(ctx.from.id);

		await this.goalView.forgotten(ctx);
	}

	protected async handleShowGoalsDec (ctx: BotContext): Promise<void>
	{
		if (!ctx.from?.id) {
			return;
		}

		ctx.logger.info('Goal handleShowGoalsDec');

		const goals = await this.goalService.getGoalsByUser(ctx.from.id);

		const goalsDec = GoalsDecMap.fromEntities(goals);

		await this.goalView.showGoalsDec(
			ctx,
			goalsDec,
			this.percents.splice(0, this.percents.length - 1), // Вырезаем 1%
			'GOAL_DEC_TITLE'
		);
	}

	// protected async handleNext (ctx: BotContext): Promise<void>
	// {
	// 	if (!ctx.from?.id) {
	// 		return;
	// 	}
	//
	// 	ctx.logger.info('Goal handleNext');
	//
	// 	const completedGoal = await this.goalService.completeGoal(ctx.from.id);
	//
	// 	if (completedGoal) {
	// 		await this.goalView.congratulateComplete(ctx, completedGoal.name);
	// 	}
	//
	// 	const nextGoal = await this.goalService.getNextGoal(ctx.from.id);
	//
	// 	if (nextGoal) {
	// 		await this.goalView.askTodayQuestion(ctx.from.id, nextGoal.name);
	// 		ctx.session.waitAnswer = WaitAnswerEnum.TODAY_QUESTION;
	// 	} else {
	// 		await this.goalView.noMoreGoals(ctx);
	// 	}
	// }

	protected async handleGoalsDec (ctx: BotContext, newGoal?: string): Promise<boolean> {
		if (!ctx.session.goalsDec) {
			ctx.session.goalsDec = new GoalsDecMap();
		}

		const index = ctx.session.goalsDec.size - 1;

		const percent = this.decompositionScript[index];
		const nextPercent = this.decompositionScript[index + 1];

		ctx.logger.info(index);
		ctx.logger.info(percent, nextPercent);

		if (percent && newGoal) {
			ctx.session.goalsDec.set(percent, newGoal);
		}

		if (!this.decompositionScript[index + 2]) {
			return false;
		}

		ctx.session.goalsDec.set(nextPercent, null);

		await this.goalView.showGoalsDec(
			ctx,
			ctx.session.goalsDec,
			this.percents,
			'GOAL_DEC_TITLE_' + (index + 1),
			index === -1 ? 'MAIN_QUESTION' : 'QUESTION',
			ctx.session.goalsDec.get(100) ?? '',
			String(nextPercent)
		);

		return true;
	}
}