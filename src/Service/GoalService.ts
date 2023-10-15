import { Repository } from 'typeorm/repository/Repository';
import { Goal } from '../Entity/Goal';
import { User } from '../Entity/User';
import { GoalStatusEnum } from '../Enum/GoalStatusEnum';
import { Not, UpdateResult } from 'typeorm';
import { GoalTypeEnum } from '../Enum/GoalTypeEnum';

export class GoalService
{
	public constructor (
		protected goalRepository: Repository<Goal>,
		protected userRepository: Repository<User>
	)
	{}

	public async getGoalsGroupByUser (): Promise<User[]>
	{
		return await this.userRepository.find({
			relations: ['goals'],
			where: {
				goals: {
					status: GoalStatusEnum.WAIT,
					timestamp: Not(0)
				}
			},
			order: {
				goals: {
					timestamp: 'ASC'
				}
			}
		});
	};

	public async forgetGoals (userId: number): Promise<UpdateResult>
	{
		return await this.goalRepository
			.createQueryBuilder()
			.update()
			.set({ status: GoalStatusEnum.FORGOTTEN })
			.where({ userId: userId })
			.execute();
	}

	// TODO: На самом деле, мы не должны создавать User в GoalService
	public async softCreateUser (userId: number): Promise<User>
	{
		let user = await this.userRepository.findOneBy({ id: userId });

		if (!user) {
			user = new User();
			user.id = userId;
			this.userRepository.save(user).catch(console.error);
		}

		return user;
	}

	public async insertGoals (goals: Goal[]): Promise<void>
	{
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
		goal.type = type;
		goal.timestamp = Date.now();

		this.goalRepository.save(goal)
			.catch(console.error);
	}

	public async updateStatus (goalId: number, status: GoalStatusEnum): Promise<void>
	{
		await this.goalRepository.update(goalId, {
			status: status
		});
	}

	public async getNextGoal (userId: number): Promise<Goal | null>
	{
		return await this.goalRepository.findOne({
			where: {
				status: GoalStatusEnum.WAIT,
				userId: userId
			},
			order: {
				timestamp: 'ASC'
			}
		});
	}

	public async getGoalsByUser (userId: number): Promise<Goal[]>
	{
		return await this.goalRepository.find({
			where: {
				status: GoalStatusEnum.WAIT,
				userId: userId
			},
			order: {
				timestamp: 'ASC'
			}
		});
	}

	public async completeGoal (userId: number): Promise<Goal | null>
	{
		await this.goalRepository.update({
			status: GoalStatusEnum.WAIT,
			type: GoalTypeEnum.TODAY,
			userId: userId
		}, {
			status: GoalStatusEnum.SUCCESS
		});

		let nextGoal = await this.getNextGoal(userId);

		if (nextGoal) {
			nextGoal.status = GoalStatusEnum.SUCCESS;
			await this.goalRepository.save(nextGoal);
		}

		return nextGoal;
	}
}