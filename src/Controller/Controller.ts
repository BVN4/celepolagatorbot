import { Telegraf } from 'telegraf';
import { Locale } from '../Locale/Locale';
import { System } from '../System/System';

export abstract class Controller {

	protected bot: Telegraf;
	protected locale: Locale;

	constructor () {
		this.bot = System.getBot();
		this.locale = Locale.getInstance();
	}

	public abstract initListeners (): void

}