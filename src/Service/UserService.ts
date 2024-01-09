import { Repository } from 'typeorm/repository/Repository';
import { User } from '../Entity/User';
import { PointStatusEnum } from '../Enum/PointStatusEnum';

export class UserService
{
	public constructor (
		protected userRepository: Repository<User>
	)
	{}

	public async softCreateUser (userId: number): Promise<User>
	{
		let user = await this.userRepository.findOneBy({ id: userId });

		if (!user) {
			user = new User();
			user.id = userId;
			await this.userRepository.save(user);
		}

		return user;
	}

	public async getNextPointGroupByUser (): Promise<User[]>
	{
		return await this.userRepository.find({
			relations: {
				goals: true,
				quests: true
			},
			where: {
				goals: {
					status: PointStatusEnum.WORK,
				},
				quests: {
					status: PointStatusEnum.WORK,
				}
			},
			order: {
				goals: {
					percent: 'ASC'
				},
				quests: {
					status: 'ASC'
				}
			}
		});
	};
}