import { System } from './System/System';
import { DB } from './DB';
import { BotService } from './Service/BotService';
import { Logger } from './System/Logger';
import { Router } from './System/Router';

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

	System.get(Router).init();

	logger.info('Bot launch');
	botService.launch();
}();
