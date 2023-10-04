import { Controller } from './Controller';
import { Context, Markup } from 'telegraf';
import { ButtonEnum } from '../Enum/ButtonEnum';
import { Repository } from 'typeorm/repository/Repository';
import { Goal } from '../Entity/Goal';
import { DB } from '../DB';

export class MainController extends Controller {

	protected static instance: MainController | null = null;

	constructor (
		protected goalRepository: Repository<Goal>
	) {
		super();
	}

	public static getInstance (): MainController {
		if (!this.instance) {
			this.instance = new MainController(
				DB.getRepository(Goal)
			);
		}

		return this.instance;
	}

	public initListeners (): void {
		this.bot.start((ctx) => this.handleStart(ctx));
	}

	protected async handleStart (ctx: Context): Promise<void> {
		if (!ctx.from?.id) {
			return;
		}

		const countGoals = await this.goalRepository.countBy({
			user: ctx.from?.id
		});

		const keyboard = [];

		keyboard.push(Markup.button.callback(this.locale.get(ButtonEnum.NEXT), ButtonEnum.NEXT));

		if (countGoals <= 0) {
			keyboard.push(Markup.button.callback(this.locale.get(ButtonEnum.LIST), ButtonEnum.LIST));
		}

		keyboard.push(Markup.button.callback(this.locale.get(ButtonEnum.NEW), ButtonEnum.NEW));

		ctx.reply(
			this.locale.get('START'),
			Markup.inlineKeyboard([keyboard])
		).then();
	}

}