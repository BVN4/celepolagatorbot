import { Context, session, SessionStore, Telegraf } from 'telegraf';

export interface BotSession {
	[key: string]: any;
}

export interface BotContext extends Context {
	session: BotSession;
}

export class BotService {
	protected session: SessionStore<BotSession> = new Map();

	constructor (
		protected telegraf: Telegraf
	) {}

	public initSession (): void {
		this.telegraf.use(
			session({
				store: this.session,
				defaultSession: () => {
					return {};
				}
			})
		);
	}

	public getSession (userId: number) {
		return this.session.get(this.makeSessionKey(userId)) ?? {};
	}

	public setSession (userId: number, data: BotSession) {
		this.session.set(this.makeSessionKey(userId), {
			...this.getSession(userId),
			...data
		});
	}

	protected makeSessionKey (userId: number): string {
		return userId + ':' + userId;
	}

	public launch (): void {
		this.telegraf.launch().then();

		// Enable graceful stop
		process.once('SIGINT', () => this.telegraf.stop('SIGINT'));
		process.once('SIGTERM', () => this.telegraf.stop('SIGTERM'));
	}
}