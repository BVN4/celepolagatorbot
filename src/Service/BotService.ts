import { Context, session, SessionStore, Telegraf } from 'telegraf';
import { Logger } from '../System/Logger';
import { BotStateEnum } from '../Enum/BotStateEnum';
import { GoalsDecMap } from '../ValueObject/GoalsDec';
import { WaitAnswerEnum } from '../Enum/WaitAnswerEnum';
import { CommandEnum } from '../Enum/CommandEnum';

export interface BotSession
{
	state?: BotStateEnum,
	waitAnswer?: WaitAnswerEnum,

	goalsDec?: GoalsDecMap,

	[key: string]: any;
}

export interface BotContext extends Context
{
	session: BotSession;

	logger: Logger;
}

export class BotService
{
	protected session: SessionStore<BotSession> = new Map();

	constructor (
		protected telegraf: Telegraf<BotContext>
	)
	{}

	public initSession (): void
	{
		this.telegraf.use(
			session({
				store: this.session,
				defaultSession: () => {
					return {};
				}
			})
		);
	}

	public initLogger (): void
	{
		this.telegraf.use(async (ctx: BotContext, next) => {
			ctx.logger = Logger.initForContext(ctx);

			ctx.logger.info('Handle. State: ' + ctx.session.state);

			await next();
		});
	}

	public initCommands (): void
	{
		this.telegraf.telegram.setMyCommands([
			{
				command: CommandEnum.START,
				description: 'Вывести стартовое меню'
			}, {
				command: CommandEnum.GOALS,
				description: 'Напомнить декомпозицию'
			}, {
				command: CommandEnum.DONE,
				description: 'Пометить сегодняшнюю цель выполненной'
			}, {
				command: CommandEnum.MOVE,
				description: 'Пометить подцель выполненной'
			}
		]).catch(console.error);
	}

	public getSession (userId: number): BotSession
	{
		return this.session.get(this.makeSessionKey(userId)) ?? {};
	}

	public setSession (userId: number, data: BotSession): void
	{
		this.session.set(this.makeSessionKey(userId), {
			...this.getSession(userId),
			...data
		});
	}

	protected makeSessionKey (userId: number): string
	{
		return userId + ':' + userId;
	}

	public launch (): void
	{
		this.telegraf.launch().then();

		// Enable graceful stop
		process.once('SIGINT', () => this.telegraf.stop('SIGINT'));
		process.once('SIGTERM', () => this.telegraf.stop('SIGTERM'));
	}
}