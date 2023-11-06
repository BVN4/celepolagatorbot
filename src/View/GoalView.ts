import { Markup } from 'telegraf';
import { ButtonEnum } from '../Enum/ButtonEnum';
import { BotContext } from '../Service/BotService';
import { cwd } from 'node:process';
import { GoalsDecMap } from '../ValueObject/GoalsDec';
import { View } from './View';

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
		percent: string = ''
	): Promise<void> {
		let text = '';

		if (title) {
			text += this.locale.get(title) + '\n\n';
		}

		for (const percent of percents) {
			let goal = goalsDec.get(percent);

			if (!goal) {
				goal = goal === null ? '???' : '';
			}

			text += percent + '% - ' + goal + '\n';
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

	public async congratulateComplete (ctx: BotContext, goalName: string): Promise<void>
	{
		await ctx.reply(
			this.locale.prepare('CONGRATULATE_COMPLETE', {
				goal: goalName
			}),
			Markup.removeKeyboard()
		);
	}

	public async noMoreGoals (ctx: BotContext): Promise<void>
	{
		const text = this.locale.get('NO_MORE_GOALS');
		const keyboard = Markup.inlineKeyboard([
			Markup.button.callback(this.locale.get(ButtonEnum.START), ButtonEnum.START)
		]);

		await ctx.reply(text, keyboard);
	}
}