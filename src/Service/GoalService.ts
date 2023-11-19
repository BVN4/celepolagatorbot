import { Repository } from 'typeorm/repository/Repository';
import { Goal } from '../Entity/Goal';
import { PointStatusEnum } from '../Enum/PointStatusEnum';
import { In, UpdateResult } from 'typeorm';
import { GoalsDecMap } from '../ValueObject/GoalsDec';

export class GoalService
{
	public constructor (
		protected goalRepository: Repository<Goal>
	)
	{}

	public async forgetGoals (userId: number): Promise<UpdateResult>
	{
		return await this.goalRepository
			.createQueryBuilder()
			.softDelete()
			.where({ userId: userId })
			.execute();
	}

	public async insertGoals (goalsDec: GoalsDecMap, userId: number): Promise<void>
	{
		let goals: any[] = [];

		goalsDec.forEach((goal, percent) => {
			if (!goal) {
				return;
			}

			goals.push({
				name: goal.name,
				percent: percent,
				userId: userId,
				status: goal.status ?? PointStatusEnum.WAIT
			});
		});

		await this.goalRepository.createQueryBuilder()
			.insert()
			.values(goals)
			.execute();
	}

	public async getNextGoal (userId: number): Promise<Goal | null>
	{
		return await this.goalRepository.findOne({
			where: {
				status: PointStatusEnum.WORK,
				userId: userId
			}
		});
	}

	public async getGoalsByUser (userId: number): Promise<Goal[]>
	{
		return await this.goalRepository.find({
			where: {
				userId: userId
			},
			order: {
				percent: 'ASC'
			}
		});
	}

	public async moveToNextGoal (userId: number): Promise<{ oldGoal: Goal | null, newGoal: Goal | null }>
	{
		const goals = await this.goalRepository.find({
			where: {
				userId: userId,
				status: In([PointStatusEnum.WORK, PointStatusEnum.WAIT])
			},
			order: {
				percent: 'ASC'
			}
		});

		const result = {
			oldGoal: goals[0] ?? null,
			newGoal: goals[1] ?? null
		};

		if (result.oldGoal) {
			result.oldGoal.status = PointStatusEnum.SUCCESS;
			await this.goalRepository.save(result.oldGoal);
		}

		if (result.newGoal) {
			result.newGoal.status = PointStatusEnum.WORK;
			await this.goalRepository.save(result.newGoal);
		}

		return result;
	}
}