import { Repository } from 'typeorm/repository/Repository';
import { Goal } from '../Entity/Goal';
import { Markup, Telegraf } from 'telegraf';
import { ButtonEnum } from '../Enum/ButtonEnum';
import { Locale } from '../Locale/Locale';
import { Time } from '../Enum/Time';
import { BotContext } from '../System/Bot';

export class GoalController {

	protected static readonly STATE = 'Goal';
	protected static readonly TIME_TO_WATCH = 20 * Time.SECOND; // 20 секунд
	protected static readonly VIDEO_URL = 'https://youtu.be/dQw4w9WgXcQ?si=CPCi9DMJyvB-Ikzh';

	// TODO: перенести в БД
	protected questions = [
		{ name: '5 лет', seconds: 5 * Time.YEAR },
		{ name: '3 года', seconds: 3 * Time.YEAR },
		{ name: '1 год', seconds: Time.YEAR },
		{ name: '6 месяцев', seconds: 6 * Time.MONTH },
		{ name: '3 месяца', seconds: 3 * Time.MONTH },
		{ name: '1 месяц', seconds: Time.MONTH },
		{ name: 'неделю', seconds: Time.WEEK }
	];

	public constructor (
		protected bot: Telegraf<BotContext>,
		protected locale: Locale,
		protected goalRepository: Repository<Goal>
	) {}

	public initListeners (): void {
		this.bot.action(ButtonEnum.NEW, (ctx) => this.handleEnter(ctx));

		this.bot.on('message', (ctx) => this.handleMessage(ctx));
	}

	protected handleEnter (ctx: BotContext): void {
		console.log(ctx)

		ctx.session.state = GoalController.STATE;

		ctx.session.goal = false;
		ctx.session.answers = [];
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

	public handleMessage (ctx: BotContext): void {
		console.log('alo');
		console.log(ctx);

		if (!ctx.message || ctx.session.timeToWait > Date.now()) {
			return; // Игнорируем, клиент ещё смотрит видео
		}

		if (ctx.session.goal === true) {
			// ctx.scene.session.goal = ctx.message.text
			return;
		}

		if (ctx.session.goal === false) {
			this.askMainQuestion(ctx);
			ctx.session.goal = true;
			return;
		}

		if (ctx.session.answers.length < this.questions.length) {
			this.askQuestion(ctx);
			return;
		}


	}

	protected askYouWatched (ctx: BotContext): void {
		ctx.reply(
			this.locale.get('YOU_WATCHED'),
			Markup.keyboard([this.locale.get('YES_WATCHED')]).oneTime()
		).then().catch(console.error);
	}

	protected askMainQuestion (ctx: BotContext): void {
		ctx.reply(
			this.locale.get('MAIN_QUESTION')
		).then().catch(console.error);
	}

	protected askQuestion (ctx: BotContext): void {
		const index = ctx.session.answers.length - 1;
		const lastAnswer = ctx.session.answers[index];
		const timeName = this.questions[index].name;

		ctx.reply(
			this.locale.prepare('QUESTION', [timeName, lastAnswer])
		).then().catch(console.error);
	}

}