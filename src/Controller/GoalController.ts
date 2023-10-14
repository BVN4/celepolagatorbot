import { Repository } from 'typeorm/repository/Repository';
import { Goal } from '../Entity/Goal';
import { deunionize, Markup, Telegraf } from 'telegraf';
import { ButtonEnum } from '../Enum/ButtonEnum';
import { Locale } from '../Locale/Locale';
import { Time } from '../Enum/Time';
import { BotContext, BotService, BotSession } from '../Service/BotService';
import { message } from 'telegraf/filters';
import cron from 'node-cron';
import { User } from '../Entity/User';
import { Not } from 'typeorm';
import { GoalStatusEnum } from '../Enum/GoalStatusEnum';

export class GoalController {

	protected static readonly STATE = 'Goal';
	protected static readonly TIME_TO_WATCH = 5 * Time.SECOND;
	protected static readonly VIDEO_URL = 'https://youtu.be/dQw4w9WgXcQ?si=CPCi9DMJyvB-Ikzh';

	// TODO: перенести в БД
	protected questions = [
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
		protected locale: Locale,
		protected goalRepository: Repository<Goal>,
		protected userRepository: Repository<User>,
		protected botService: BotService
	) {}

	public init (): void {
		this.bot.action(ButtonEnum.NEW, (ctx) => this.handleEnter(ctx));
		this.bot.action(ButtonEnum.FORGET_CONFIRM, (ctx) => this.handleForget(ctx));

		this.bot.on(message('text'), (ctx) => this.handleMessage(ctx));

		cron.schedule('*/10 * * * *', () => this.handleCron());
	}

	protected handleEnter (ctx: BotContext): void {
		ctx.session.state = GoalController.STATE;

		ctx.session.goals = [];

		ctx.session.reg = true;
		ctx.session.wait = true;
		ctx.session.timeToWait = Date.now() + GoalController.TIME_TO_WATCH;

		ctx.editMessageText(
			this.locale.get('WATCH_VIDEO'),
			Markup.inlineKeyboard([
				Markup.button.url(this.locale.get(ButtonEnum.VIDEO_URL), GoalController.VIDEO_URL)
			])
		).then(() => {
			setTimeout(() => this.askYouWatched(ctx), GoalController.TIME_TO_WATCH);
		}).catch(console.error);
	}

	protected async handleMessage (ctx: BotContext): Promise<void> {
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

			this.askMainQuestion(ctx);
			ctx.session.wait = false;
			return;
		}

		if (ctx.session.reg) {
			const index = ctx.session.goals.length;

			if (text.length > 255) {
				ctx.reply(
					this.locale.get('ERROR_VERY_LONG_GOAL')
				).then().catch(console.error);
				return;
			}

			ctx.session.goals.push({
				name: text,
				timestamp: index ? this.questions[index - 1].time + Date.now() : 0,
				userId: ctx.from.id
			});

			if (ctx.session.goals.length <= this.questions.length) {
				this.askQuestion(ctx, index, text);
				return;
			}

			const user = await this.userRepository.findOneBy({ id: ctx.from.id }) ?? new User();
			user.id = ctx.from.id;
			this.userRepository.save(user).catch(console.error);

			this.goalRepository.createQueryBuilder()
				.insert()
				.values(ctx.session.goals)
				.execute()
				.catch(console.error);

			const lastGoalName = ctx.session.goals.pop().name;

			ctx.session.goals = [];
			ctx.session.reg = false;

			this.askTodayQuestion(user.id, lastGoalName);
			ctx.session.waitTodayAnswer = true;
			return;
		}

		if (ctx.session.waitTodayAnswer) {
			if (text.length > 255) {
				ctx.reply(
					this.locale.get('ERROR_VERY_LONG_GOAL')
				).then().catch(console.error);
				return;
			}

			let goal = this.goalRepository.create();
			goal.name = text;
			goal.userId = ctx.from.id;
			goal.timestamp = Date.now();
			this.goalRepository.save(goal)
				.catch(console.error);
			ctx.reply(this.locale.get('GOAL_WAIT')).then().catch(console.error);

			ctx.session.waitTodayAnswer = false;
		}

		if (ctx.session.waitResultAnswer) {
			let goal = await this.goalRepository.findOneBy({ id: ctx.session.waitResultAnswer }) ?? new Goal();

			if (/Да, удалось/iu.test(text)) {
				goal.status = GoalStatusEnum.SUCCESS;
				ctx.reply(this.locale.get('GOAL_SUCCESS')).then().catch(console.error);
			} else {
				goal.status = GoalStatusEnum.FAILED;
				ctx.reply(this.locale.get('GOAL_FAILED')).then().catch(console.error);
			}
			await this.goalRepository.save(goal);

			ctx.session.waitResultAnswer = false;

			const nextGoal = await this.goalRepository.findOne({
				where: {
					status: GoalStatusEnum.WAIT,
					timestamp: Not(0),
					userId: ctx.from.id
				},
				order: {
					timestamp: 'ASC'
				}
			});

			if (!nextGoal) {
				return;
			}

			this.askTodayQuestion(ctx.from.id, nextGoal.name);
			ctx.session.waitTodayAnswer = true;
		}
	}

	protected async handleCron (): Promise<void> {
		const now = Date.now();

		const users = await this.userRepository.find({
			relations: ['goals'],
			where: {
				goals: {
					status: GoalStatusEnum.WAIT,
					timestamp: Not(0)
				}
			},
			order: {
				goals: {
					timestamp: 'ASC'
				}
			}
		});

		for (const user of users) {
			if (!user.goals || !user.goals.length) {
				continue;
			}

			const goal = user.goals[0];
			let session: BotSession = {
				state: GoalController.STATE
			};

			if (goal.timestamp < now) {
				this.askResultQuestion(user.id, goal.name);
				session['waitResultAnswer'] = goal.id;
			} else {
				this.askTodayQuestion(user.id, goal.name);
				session['waitTodayAnswer'] = true;
			}

			this.botService.setSession(user.id, session);
		}
	}

	protected async handleForget (ctx: BotContext): Promise<void> {
		if (!ctx.from?.id) {
			return;
		}

		await this.goalRepository
			.createQueryBuilder()
			.update()
			.set({ status: GoalStatusEnum.FORGOTTEN })
			.where({ userId: ctx.from.id })
			.execute();

		const text = this.locale.get('FORGOTTEN');
		const keyboard = Markup.inlineKeyboard([
			Markup.button.callback(this.locale.get(ButtonEnum.START), ButtonEnum.START)
		]);

		ctx.editMessageText(text, keyboard).then().catch(console.error);
	}

	protected askYouWatched (ctx: BotContext): void {
		ctx.reply(
			this.locale.get('YOU_WATCHED'),
			Markup.keyboard([this.locale.get('YES_WATCHED')])
				.oneTime()
				.resize()
		).then().catch(console.error);
	}

	protected askMainQuestion (ctx: BotContext): void {
		ctx.reply(
			this.locale.get('MAIN_QUESTION')
		).then().catch(console.error);
	}

	protected askQuestion (ctx: BotContext, index: number, target: string): void {
		ctx.reply(
			this.locale.prepare('QUESTION', {
				timeName: this.questions[index].name,
				target: target
			})
		).then().catch(console.error);
	}

	protected askTodayQuestion (userId: number, target: string): void {
		this.bot.telegram.sendMessage(
			userId,
			this.locale.prepare('TODAY_QUESTION', {
				target: target
			})
		).catch(console.error);
	}

	protected askResultQuestion (userId: number, target: string): void {
		this.bot.telegram.sendMessage(
			userId,
			this.locale.prepare('RESULT_QUESTION', {
				target: target
			}),
			Markup.keyboard([this.locale.get('YES_SUCCESS'), this.locale.get('NO_FAILED')])
				.oneTime()
				.resize()
		).catch(console.error);
	}

}