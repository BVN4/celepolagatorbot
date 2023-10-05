import { System } from './System/System';
import { MainController } from './Controller/MainController';
import { DB } from './DB';
import { Telegraf } from 'telegraf';
import { NewGoalController } from './Controller/NewGoalController';
import { ScenesService } from './Service/ScenesService';

!async function () {
	await DB.init();

	const bot = System.get(Telegraf);
	const scenesService = System.get(ScenesService);

	System.get(MainController).initListeners();
	System.get(NewGoalController).initListeners();

	scenesService.init();

	bot.launch().then();

	// Enable graceful stop
	process.once('SIGINT', () => bot.stop('SIGINT'));
	process.once('SIGTERM', () => bot.stop('SIGTERM'));
}();
