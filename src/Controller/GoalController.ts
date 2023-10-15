import { Goal } from '../Entity/Goal';
import { deunionize, Telegraf } from 'telegraf';
import { ButtonEnum } from '../Enum/ButtonEnum';
import { Time } from '../Enum/Time';
import { BotContext, BotService } from '../Service/BotService';
import { message } from 'telegraf/filters';
import cron from 'node-cron';
import { GoalStatusEnum } from '../Enum/GoalStatusEnum';
import { GoalView } from '../View/GoalView';
import { GoalService } from '../Service/GoalService';
import { GoalTypeEnum } from '../Enum/GoalTypeEnum';
import { CommandEnum } from '../Enum/CommandEnum';

export class GoalController
{
	protected static readonly STATE = 'Goal';
	protected static readonly TIME_TO_WATCH = 5 * Time.SECOND;

	// TODO: Костыль. Пока не понятно, где они должны лежать,
	//  потому пока тут, но по хорошему, тут их быть не должно
	public static readonly questions = [
		{ name: '5 лет', time: 5 * Time.YEAR },
		{ name: '3 года', time: 3 * Time.YEAR },
		{ name: '1 год', time: Time.YEAR },
		{ name: '6 месяцев', time: 6 * Time.MONTH },
		{ name: '3 месяца', time: 3 * Time.MONTH },
		{ name: '1 месяц', time: Time.MONTH },
		{ name: 'неделю', time: Time.WEEK }
	];

	public constructor (
		protected bot: Telegraf<BotContext>,
		protected botService: BotService,
		protected goalService: GoalService,
		protected goalView: GoalView
	)
	{}

	public init (): void
	{
		this.bot.action(ButtonEnum.NEW, (ctx) => this.handleEnter(ctx));
		this.bot.action(ButtonEnum.FORGET_CONFIRM, (ctx) => this.handleForget(ctx));

		this.bot.command(CommandEnum.NEXT, (ctx) => this.handleNext(ctx));

		this.bot.on(message('text'), (ctx) => this.handleMessage(ctx));

		cron.schedule('*/10 * * * *', () => this.handleCron());
	}

	protected handleEnter (ctx: BotContext): void
	{
		ctx.session.state = GoalController.STATE;

		ctx.session.goals = [];

		ctx.session.reg = true;
		ctx.session.wait = true;
		ctx.session.timeToWait = Date.now() + GoalController.TIME_TO_WATCH;

		this.goalView.watchVideo(ctx, GoalController.TIME_TO_WATCH);
	}

	protected async handleMessage (ctx: BotContext): Promise<void>
	{
		if (!ctx.message || !ctx.from?.id || ctx.session.state !== GoalController.STATE) {
			return;
		}

		const message = deunionize(ctx.message);
		const text = message.text ?? '';

		if (!text) {
			return;
		}

		if (ctx.session.wait) {
			if (ctx.session.timeToWait > Date.now() || !/да/i.test(text)) {
				return; // Игнорируем, клиент ещё смотрит видео
			}

			this.goalView.reply(ctx, 'MAIN_QUESTION');
			ctx.session.wait = false;
			return;
		}

		if (ctx.session.reg) {
			const index = ctx.session.goals.length;

			if (text.length > 255) {
				this.goalView.reply(ctx, 'ERROR_VERY_LONG_GOAL');
				return;
			}

			ctx.session.goals.push({
				name: text,
				type: index ? GoalTypeEnum.PRIMARY : GoalTypeEnum.GLOBAL,
				timestamp: index
					// TODO: Костыль. Не понимаем временных рамок глобальной цели,
					//  потому ставим максимальное, чтобы не ломать сортировки
					? GoalController.questions[index - 1].time + Date.now()
					: GoalController.questions[index].time + Date.now() + Time.YEAR,
				userId: ctx.from.id
			});

			if (ctx.session.goals.length <= GoalController.questions.length) {
				this.goalView.askQuestion(ctx, index, text);
				return;
			}

			const user = await this.goalService.softCreateUser(ctx.from.id);

			await this.goalService.insertGoals(ctx.session.goals);

			const lastGoalName = ctx.session.goals[ctx.session.goals.length - 1].name;

			ctx.session.goals = [];
			ctx.session.reg = false;

			this.goalView.askTodayQuestion(user.id, lastGoalName);
			ctx.session.waitTodayAnswer = true;
			return;
		}

		if (ctx.session.waitTodayAnswer) {
			if (text.length > 255) {
				this.goalView.reply(ctx, 'ERROR_VERY_LONG_GOAL');
				return;
			}

			this.goalService.createGoal(ctx.from.id, text);

			this.goalView.reply(ctx, 'GOAL_WAIT');

			ctx.session.waitTodayAnswer = false;
		}

		if (ctx.session.waitResultAnswer) {
			if (/Да, удалось/iu.test(text)) {
				await this.goalService.updateStatus(ctx.session.waitResultAnswer, GoalStatusEnum.SUCCESS);
				this.goalView.reply(ctx, 'GOAL_SUCCESS');
			} else {
				await this.goalService.updateStatus(ctx.session.waitResultAnswer, GoalStatusEnum.FAILED);
				this.goalView.reply(ctx, 'GOAL_FAILED');
			}

			ctx.session.waitResultAnswer = false;

			const nextGoal = await this.goalService.getNextGoal(ctx.from.id);
			if (nextGoal) {
				this.goalView.askTodayQuestion(ctx.from.id, nextGoal.name);
				ctx.session.waitTodayAnswer = true;
			}
		}
	}

	protected async handleCron (): Promise<void>
	{
		const now = Date.now();

		const users = await this.goalService.getGoalsGroupByUser();

		for (const user of users) {
			if (!user.goals || !user.goals.length) {
				continue;
			}

			let session = this.botService.getSession(user.id);

			if (session.waitResultAnswer || session.waitTodayAnswer) {
				continue; // Уже ждём ответа, не будем спамить
			}

			const goal = user.goals[0];

			session['state'] = GoalController.STATE;

			if (goal.timestamp < now) {
				this.goalView.askResultQuestion(user.id, goal.name);
				session['waitResultAnswer'] = goal.id;
			} else {
				this.goalView.askTodayQuestion(user.id, goal.name);
				session['waitTodayAnswer'] = true;
			}

			this.botService.setSession(user.id, session);
		}
	}

	protected async handleForget (ctx: BotContext): Promise<void>
	{
		if (!ctx.from?.id) {
			return;
		}

		await this.goalService.forgetGoals(ctx.from.id);

		this.goalView.forgotten(ctx);
	}

	protected async handleNext (ctx: BotContext): Promise<void>
	{
		if (!ctx.from?.id) {
			return;
		}

		const completedGoal = await this.goalService.completeGoal(ctx.from.id);

		if (completedGoal) {
			this.goalView.congratulateComplete(ctx, completedGoal.name);
		}

		const nextGoal = await this.goalService.getNextGoal(ctx.from.id);

		if (nextGoal) {
			this.goalView.askTodayQuestion(ctx.from.id, nextGoal.name);
			ctx.session.waitTodayAnswer = true;
		} else {
			this.goalView.noMoreGoals(ctx);
		}
	}
}