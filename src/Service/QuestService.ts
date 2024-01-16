import { Repository } from 'typeorm/repository/Repository';
import { Quest } from '../Entity/Quest';
import { PointStatusEnum } from '../Enum/PointStatusEnum';
import { UpdateResult } from 'typeorm';

export class QuestService
{
	public constructor (
		protected questRepository: Repository<Quest>
	)
	{}

	public async forgetQuests (userId: number): Promise<UpdateResult>
	{
		return await this.questRepository
			.createQueryBuilder()
			.softDelete()
			.where({ userId: userId })
			.execute();
	}

	public async getNextQuest (userId: number): Promise<Quest | null>
	{
		return await this.questRepository.findOne({
			where: {
				status: PointStatusEnum.WORK,
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
		quest.status = PointStatusEnum.WORK;
		quest.timestamp = Math.round(Date.now() / 1000);

		await this.questRepository.save(quest);
	}

	public async updateStatus (questId: number, status: PointStatusEnum): Promise<void>
	{
		await this.questRepository.update(questId, {
			status: status
		});
	}
}