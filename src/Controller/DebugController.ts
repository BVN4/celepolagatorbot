import { deunionize, Telegraf } from 'telegraf';
import { BotContext, BotService } from '../Service/BotService';
import { CommandEnum } from '../Enum/CommandEnum';
import { WaitAnswerEnum } from '../Enum/WaitAnswerEnum';
import { BotStateEnum } from '../Enum/BotStateEnum';
import { DebugView } from '../View/DebugView';

export class DebugController
{
	public constructor (
		protected bot: Telegraf<BotContext>,
		protected botService: BotService,
		protected debugView: DebugView
	)
	{}

	public init ()
	{
		this.bot.command(CommandEnum.DUMP_SESSION, (ctx) => this.handleDumpSessionCommand(ctx));
	}

	protected async handleDumpSessionCommand (ctx: BotContext): Promise<void>
	{
		if (!ctx.from?.id || !this.botService.isAdmin(ctx.from.id)) {
			return;
		}

		ctx.logger.info('Debug handleDumpSessionCommand');

		ctx.session.waitAnswer = WaitAnswerEnum.DUMP_SESSION;
		ctx.session.state = BotStateEnum.DEBUG;

		await this.debugView.askUseId(ctx);
	}

	public async handleMessage (ctx: BotContext): Promise<void>
	{
		if (!ctx.message || !ctx.from?.id || !this.botService.isAdmin(ctx.from.id)) {
			return;
		}

		const message = deunionize(ctx.message);
		const text = message.text ?? '';

		if (!text) {
			ctx.logger.info('Text empty');
			return;
		}

		if (ctx.session.waitAnswer === WaitAnswerEnum.DUMP_SESSION) {
			let session = this.botService.getSession(Number(text));

			await this.debugView.dumpData(ctx, JSON.stringify(session, null, 2));
		}
	}
}