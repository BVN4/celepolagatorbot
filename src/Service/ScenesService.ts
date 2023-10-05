import { Scenes, session, Telegraf } from 'telegraf';

interface BotSceneSession extends Scenes.SceneSessionData {
	[key: string]: any;
}

export type BotSceneContext = Scenes.SceneContext<BotSceneSession>;

export class ScenesService {

	protected scenes: {
		[key: string]: Scenes.BaseScene<BotSceneContext>
	} = {};

	public constructor (
		protected bot: Telegraf<BotSceneContext>
	) {}

	public init () {
		const stage = new Scenes.Stage<BotSceneContext>(
			Object.values(this.scenes),
			{
				ttl: 10
			}
		);

		this.bot.use(session());
		this.bot.use(stage.middleware());
	}

	public scene (id: string) {
		if (!this.scenes[id]) {
			this.scenes[id] = new Scenes.BaseScene<BotSceneContext>(id);
		}

		return this.scenes[id];
	}

}