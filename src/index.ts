import { System } from './System/System';
import { MainController } from './Controller/MainController';
import { DB } from './DB';
import { GoalController } from './Controller/GoalController';
import { BotService } from './Service/BotService';
import { Logger } from './System/Logger';

process
	.on('unhandledRejection', console.error)
	.on('uncaughtException', console.error);

!async function () {
	const logger = System.get(Logger);

	logger.info('Start bot');

	await DB.init();

	const botService = System.get(BotService);

	botService.initCommands();
	botService.initSession();
	botService.initLogger();

	System.get(MainController).init();
	System.get(GoalController).init();

	logger.info('Bot launch');
	botService.launch();
}();
