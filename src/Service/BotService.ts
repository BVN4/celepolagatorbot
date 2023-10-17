import { Context, session, SessionStore, Telegraf } from 'telegraf';
import { CommandEnum } from '../Enum/CommandEnum';
import { Logger } from '../System/Logger';

export interface BotSession
{
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
				command: 'start',
				description: 'Start message'
			},
			{
				command: CommandEnum.NEXT,
				description: 'Greetings command'
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