import { System } from './System/System';
import { MainController } from './Controller/MainController';
import { DB } from './DB';
import { Config } from './Config/Config';

!async function () {
	Config.getInstance();

	await DB.init();
	System.init();

	MainController.getInstance().initListeners();

	System.launchBot();
}();
