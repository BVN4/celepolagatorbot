import { Repository } from 'typeorm/repository/Repository';
import { Quest } from '../Entity/Quest';
import { PointStatusEnum } from '../Enum/PointStatusEnum';

export class QuestService
{
	public constructor (
		protected questRepository: Repository<Quest>
	)
	{}

	public async getNextQuest (userId: number): Promise<Quest | null>
	{
		return await this.questRepository.findOne({
			where: {
				status: PointStatusEnum.WAIT,
				userId: userId
			},
			order: {
				timestamp: 'ASC'
			}
		});
	}

	public async createTodayQuest (userId: number, text: string): Promise<void>
	{
		let quest = this.questRepository.create();

		quest.name = text;
		quest.userId = userId;

		await this.questRepository.save(quest);
	}

	public async updateStatus (questId: number, status: PointStatusEnum): Promise<void>
	{
		await this.questRepository.update(questId, {
			status: status
		});
	}
}