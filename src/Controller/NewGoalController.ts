import { Repository } from 'typeorm/repository/Repository';
import { Goal } from '../Entity/Goal';
import { Checkpoint } from '../Entity/Checkpoint';
import { SceneEnum } from '../Enum/SceneEnum';
import { BotSceneContext, ScenesService } from '../Service/ScenesService';
import { Markup, Telegraf } from 'telegraf';
import { ButtonEnum } from '../Enum/ButtonEnum';
import { Locale } from '../Locale/Locale';

export class NewGoalController {

	protected questions = [];

	public constructor (
		protected bot: Telegraf<BotSceneContext>,
		protected locale: Locale,
		protected scenesService: ScenesService,
		protected goalRepository: Repository<Goal>,
		protected checkpointRepository: Repository<Checkpoint>
	) {}

	public initListeners (): void {
		this.bot.action(ButtonEnum.NEW, (ctx) => {
			ctx.scene.enter(SceneEnum.NEW_GOAL);
		});

		const scene = this.scenesService.scene(SceneEnum.NEW_GOAL);

		scene.enter((ctx: BotSceneContext) => {
			ctx.scene.session.questions = [];
			ctx.editMessageCaption(
				this.locale.get('NEW_GOAL'),
				Markup.inlineKeyboard([
					Markup.button.callback(this.locale.get(ButtonEnum.BACK), ButtonEnum.START)
				])
			).then();
		});

		// scene.on('message', (ctx) => this.handleQuestion(ctx));
	}

	// public handleQuestion (ctx: BotSceneContext) {
	//
	// }

}