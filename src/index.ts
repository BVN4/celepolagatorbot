import { System } from './System/System';
import { MainController } from './Controller/MainController';
import { DB } from './DB';
import { session, Telegraf } from 'telegraf';
import { GoalController } from './Controller/GoalController';
import { BotContext } from './System/Bot';

!async function () {
	await DB.init();

	const bot = System.get(Telegraf<BotContext>);

	bot.use(session());
	bot.use((ctx, next) => {
		ctx.session ??= {};
		return next();
	});

	System.get(MainController).initListeners();
	System.get(GoalController).initListeners();

	bot.launch().then();

	// Enable graceful stop
	process.once('SIGINT', () => bot.stop('SIGINT'));
	process.once('SIGTERM', () => bot.stop('SIGTERM'));
}();
