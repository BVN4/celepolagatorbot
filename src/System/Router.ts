import { MainController } from '../Controller/MainController';
import { GoalController } from '../Controller/GoalController';
import { Telegraf } from 'telegraf';
import { BotContext } from '../Service/BotService';
import { message } from 'telegraf/filters';
import { BotStateEnum } from '../Enum/BotStateEnum';
import { QuestController } from '../Controller/QuestController';
import { DebugController } from '../Controller/DebugController';

export class Router
{
	public constructor (
		protected bot: Telegraf<BotContext>,
		protected goalController: GoalController,
		protected mainController: MainController,
		protected questController: QuestController,
		protected debugController: DebugController
	)
	{}

	public init (): void
	{
		this.goalController.init();
		this.mainController.init();
		this.questController.init();
		this.debugController.init();

		this.bot.on(message('text'), (ctx) => this.handleMessage(ctx));
	}

	protected async handleMessage (ctx: BotContext): Promise<void>
	{
		ctx.logger.info('HandleMessage. State: ' + ctx.session.state + ', Wait Answer: ' + ctx.session.waitAnswer);

		switch (ctx.session.state) {
			case BotStateEnum.GOAL:
				await this.goalController.handleMessage(ctx);
				break;
			case BotStateEnum.QUEST:
				await this.questController.handleMessage(ctx);
				break;
			case BotStateEnum.DEBUG:
				await this.debugController.handleMessage(ctx);
				break;
		}
	}
}