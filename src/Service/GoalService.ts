import { Repository } from 'typeorm/repository/Repository';
import { Goal } from '../Entity/Goal';
import { User } from '../Entity/User';
import { GoalStatusEnum } from '../Enum/GoalStatusEnum';
import { Not, UpdateResult } from 'typeorm';

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

	public createGoal (text: string, userId: number): void
	{
		let goal = this.goalRepository.create();

		goal.name = text;
		goal.userId = userId;
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
				timestamp: Not(0),
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
}