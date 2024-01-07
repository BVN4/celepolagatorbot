import { deunionize, Telegraf } from 'telegraf';
import { BotContext, BotService } from '../Service/BotService';
import { GoalService } from '../Service/GoalService';
import { QuestService } from '../Service/QuestService';
import { UserService } from '../Service/UserService';
import { WaitAnswerEnum } from '../Enum/WaitAnswerEnum';
import { PointStatusEnum } from '../Enum/PointStatusEnum';
import { BotStateEnum } from '../Enum/BotStateEnum';
import { QuestView } from '../View/QuestView';
import { CommandEnum } from '../Enum/CommandEnum';
import cron from 'node-cron';
import { Logger } from '../System/Logger';

export class QuestController
{
	public constructor (
		protected bot: Telegraf<BotContext>,
		protected botService: BotService,
		protected goalService: GoalService,
		protected questService: QuestService,
		protected userService: UserService,
		protected questView: QuestView,
		protected logger: Logger
	)
	{}

	public init ()
	{
		cron.schedule('02 9 * * *', () => this.handleCron());

		this.bot.command(CommandEnum.DONE, (ctx) => this.handleDoneQuest(ctx));
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

		if (ctx.session.waitAnswer === WaitAnswerEnum.TODAY_QUESTION) {
			if (text.length > 255) {
				await this.questView.reply(ctx, 'ERROR_VERY_LONG_GOAL');
				ctx.logger.warn('Very long message');
				return;
			}

			await this.questService.createTodayQuest(ctx.from.id, text);

			await this.questView.prepareReply(ctx, 'QUEST_CREATED', {
				target: text
			});

			delete ctx.session.waitAnswer;
			return;
		}

		if (ctx.session.waitAnswer === WaitAnswerEnum.RESULT_QUESTION) {
			if (/Да, удалось/iu.test(text)) {
				await this.questService.updateStatus(ctx.session.waitAnswerForQuest, PointStatusEnum.SUCCESS);

				delete ctx.session.waitAnswer;

				const nextGoal = await this.goalService.getNextGoal(ctx.from.id);
				if (nextGoal) {
					await this.questView.askTodayQuestion(ctx.from.id, nextGoal.name, 'QUEST_SUCCESS');
					ctx.session.waitAnswer = WaitAnswerEnum.TODAY_QUESTION;
				}
			} else if (/Нет, не удалось/iu.test(text)) {
				await this.questView.askWhatsNextQuestion(ctx);
				ctx.session.waitAnswer = WaitAnswerEnum.WHATS_NEXT;
			} else {
				await this.questView.notUnderstand(ctx);
			}
			return;
		}

		if (ctx.session.waitAnswer === WaitAnswerEnum.WHATS_NEXT) {
			delete ctx.session.waitAnswer;

			if (/Оставить/iu.test(text)) {
				await this.questView.reply(ctx, 'QUEST_AGAIN_CREATE');
			} else if (/Установить новую/iu.test(text)) {
				await this.questService.updateStatus(ctx.session.waitAnswerForQuest, PointStatusEnum.FAILED);
				const nextGoal = await this.goalService.getNextGoal(ctx.from.id);
				if (nextGoal) {
					await this.questView.askTodayQuestion(ctx.from.id, nextGoal.name, 'QUEST_RENEW');
					ctx.session.waitAnswer = WaitAnswerEnum.TODAY_QUESTION;
				}
			} else {
				await this.questView.notUnderstand(ctx);
			}
			return;
		}
	}

	protected async handleCron (): Promise<void>
	{
		this.logger.setPrefix('[CRON] ');

		const users = await this.userService.getNextPointGroupByUser();

		this.logger.info('Quest handleCron, found users: ' + users.length);

		for (const user of users) {
			if (!user.goals || !user.goals.length) {
				this.logger.warn('User ' + user.id + ' has no goals');
				continue;
			}

			let session = this.botService.getSession(user.id);

			if (
				session.waitAnswer
				&& [WaitAnswerEnum.RESULT_QUESTION, WaitAnswerEnum.TODAY_QUESTION].includes(session.waitAnswer)
			) {
				this.logger.warn('User ' + user.id + ' received a question');
				continue; // Уже ждём ответа, не будем спамить
			}

			const goal = user.goals[0];
			const quest = user.quests[0];

			session.state = BotStateEnum.QUEST;

			if (quest && quest.status === PointStatusEnum.WORK) {
				this.logger.info('User ' + user.id + ' was ask result question');
				await this.questView.askResultQuestion(user.id, quest.name);
				session.waitAnswer = WaitAnswerEnum.RESULT_QUESTION;
				session.waitAnswerForQuest = quest.id;
			} else {
				this.logger.info('User ' + user.id + ' was ask today question');
				await this.questView.askTodayQuestion(user.id, goal.name);
				session.waitAnswer = WaitAnswerEnum.TODAY_QUESTION;
			}

			this.botService.setSession(user.id, session);
		}

		this.logger.info('End Quest handleCron');
	}

	protected async handleDoneQuest (ctx: BotContext): Promise<void>
	{
		if (!ctx.from?.id) {
			return;
		}

		ctx.logger.info('Quest handleDoneQuest');

		const quest = await this.questService.getNextQuest(ctx.from.id);

		ctx.session.state = BotStateEnum.QUEST;

		if (quest && quest.status === PointStatusEnum.WORK) {
			await this.questView.askResultQuestion(ctx.from.id, quest.name);
			ctx.session.waitAnswer = WaitAnswerEnum.RESULT_QUESTION;
			ctx.session.waitAnswerForQuest = quest.id;
		} else {
			const goal = await this.goalService.getNextGoal(ctx.from.id);
			if (goal) {
				await this.questView.askTodayQuestion(ctx.from.id, goal.name);
				ctx.session.waitAnswer = WaitAnswerEnum.TODAY_QUESTION;
			} else {
				await this.questView.reply(ctx, 'NOT_UNDERSTAND_NO_GOALS');
			}
		}
	}
}