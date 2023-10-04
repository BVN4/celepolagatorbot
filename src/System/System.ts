import { Telegraf } from 'telegraf';
import { Config } from '../Config/Config';

export class System {

	protected static instance: System;

	protected constructor (
		protected bot: Telegraf
	) {}

	public static init (): System {
		const config = Config.getInstance();

		return this.instance = new System(
			new Telegraf(config.getToken())
		);
	}

	public static getBot () {
		return this.instance.bot;
	}

	public static launchBot () {
		this.instance.bot.launch().then();

		// Enable graceful stop
		process.once('SIGINT', () => this.instance.bot.stop('SIGINT'));
		process.once('SIGTERM', () => this.instance.bot.stop('SIGTERM'));
	}
}
