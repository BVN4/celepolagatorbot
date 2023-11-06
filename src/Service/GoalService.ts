import { Repository } from 'typeorm/repository/Repository';
import { Goal } from '../Entity/Goal';
import { PointStatusEnum } from '../Enum/PointStatusEnum';
import { UpdateResult } from 'typeorm';
import { GoalTypeEnum } from '../Enum/GoalTypeEnum';
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
			.update()
			.set({ status: PointStatusEnum.FORGOTTEN })
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
				name: goal,
				percent: percent,
				userId: userId
			});
		});

		await this.goalRepository.createQueryBuilder()
			.insert()
			.values(goals)
			.execute();
	}

	public createGoal (userId: number, text: string, type: GoalTypeEnum = GoalTypeEnum.TODAY): void
	{
		let goal = this.goalRepository.create();

		goal.name = text;
		goal.userId = userId;

		this.goalRepository.save(goal)
			.catch(console.error);
	}

	public async getNextGoal (userId: number): Promise<Goal | null>
	{
		return await this.goalRepository.findOne({
			where: {
				status: PointStatusEnum.WAIT,
				userId: userId
			},
			order: {
				percent: 'ASC'
			}
		});
	}

	public async getGoalsByUser (userId: number): Promise<Goal[]>
	{
		return await this.goalRepository.find({
			where: {
				status: PointStatusEnum.WAIT,
				userId: userId
			},
			order: {
				percent: 'ASC'
			}
		});
	}

	public async completeGoal (userId: number): Promise<Goal | null>
	{
		await this.goalRepository.update({
			status: PointStatusEnum.WAIT,
			userId: userId
		}, {
			status: PointStatusEnum.SUCCESS
		});

		let nextGoal = await this.getNextGoal(userId);

		if (nextGoal) {
			nextGoal.status = PointStatusEnum.SUCCESS;
			await this.goalRepository.save(nextGoal);
		}

		return nextGoal;
	}
}