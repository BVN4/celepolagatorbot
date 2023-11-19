import { Markup } from 'telegraf';
import { ButtonEnum } from '../Enum/ButtonEnum';
import { BotContext } from '../Service/BotService';
import { cwd } from 'node:process';
import { GoalsDecMap } from '../ValueObject/GoalsDec';
import { View } from './View';
import { PointStatusEnum } from '../Enum/PointStatusEnum';
import { PointStatusToEmojiMap } from '../Enum/PointStatusToEmojiMap';

export class GoalView extends View
{
	public async showPathToGoalPic (ctx: BotContext): Promise<void>
	{
		await ctx.replyWithPhoto({
			source: cwd() + '/assets/path_to_goal.jpg'
		}, {
			caption: this.locale.get('PATH_TO_GOAL_PIC')
		});
	}

	public async showGoalsDec (
		ctx: BotContext,
		goalsDec: GoalsDecMap,
		percents: number[],
		title: string = '',
		question: string = '',
		target: string = '',
		percent: string = '',
		showStatus: boolean = true,
	): Promise<void> {
		let text = '';

		if (title) {
			text += this.locale.get(title) + '\n\n';
		}

		for (const percent of percents) {
			let goal = goalsDec.get(percent);
			let status = PointStatusEnum.WAIT;
			let name = '';

			if (goal) {
				name = goal.name;
				if (goal.status && showStatus) {
					status = goal.status;
				}
			} else if (goal === null) {
				name = '???';
			}

			text += PointStatusToEmojiMap[status] + ' ' + percent + '% - ' + name + '\n';
		}

		if (question) {
			text += '\n' + this.locale.prepare(question, {
				target: target,
				percent: percent
			});
		}

		await ctx.reply(text);
	}

	public async forgotten (ctx: BotContext): Promise<void>
	{
		const text = this.locale.get('FORGOTTEN');
		const keyboard = Markup.inlineKeyboard([
			Markup.button.callback(this.locale.get(ButtonEnum.START), ButtonEnum.START)
		]);

		await ctx.editMessageText(text, keyboard);
	}

	public async completeGoal (ctx: BotContext, percent: number, target: string = ''): Promise<void>
	{
		let text = this.locale.prepare('COMPLETE_GOAL_' + percent, { target: target });

		if (target) {
			text += '\n\n' + this.locale.prepare('TODAY_QUESTION', {
				target: target,
			});
		}

		await ctx.reply(text);
	}
}