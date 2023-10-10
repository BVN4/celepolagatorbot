import { Context } from 'telegraf';

export interface BotSession {
	[key: string]: any;
}

export interface BotContext extends Context {
	session: BotSession;
}