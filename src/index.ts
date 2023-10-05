import { System } from './System/System';
import { MainController } from './Controller/MainController';
import { DB } from './DB';
import { Telegraf } from 'telegraf';

!async function () {
	await DB.init();

	System.get(MainController).initListeners();

	const bot = System.get(Telegraf);

	bot.launch().then();

	// Enable graceful stop
	process.once('SIGINT', () => bot.stop('SIGINT'));
	process.once('SIGTERM', () => bot.stop('SIGTERM'));
}();
