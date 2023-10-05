import { Telegraf } from 'telegraf';
import { Locale } from '../Locale/Locale';
import { System } from '../System/System';

export abstract class Controller {

	protected bot: Telegraf;
	protected locale: Locale;

	protected constructor () {
		this.bot = System.get(Telegraf);
		this.locale = System.get(Locale);
	}

	public abstract initListeners (): void

}