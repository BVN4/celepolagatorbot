import { System } from './System/System';
import { MainController } from './Controller/MainController';
import { DB } from './DB';
import { GoalController } from './Controller/GoalController';
import { BotService } from './Service/BotService';

process
	.on('unhandledRejection', console.error)
	.on('uncaughtException', console.error);

!async function () {
	await DB.init();

	const botService = System.get(BotService);

	botService.initCommands();
	botService.initSession();

	System.get(MainController).init();
	System.get(GoalController).init();

	botService.launch();
}();
