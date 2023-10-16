import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';
import { GoalStatusEnum } from '../Enum/GoalStatusEnum';
import { GoalTypeEnum } from '../Enum/GoalTypeEnum';

@Entity({ name: 'goals' })
export class Goal
{
	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	name!: string;

	@Column({ type: 'tinyint', default: GoalStatusEnum.WAIT })
	status: GoalStatusEnum = GoalStatusEnum.WAIT;

	@Column({ type: 'tinyint', default: GoalTypeEnum.TODAY })
	type: GoalTypeEnum = GoalTypeEnum.TODAY;

	@Column({ type: 'bigint', unsigned: true, default: 0 })
	timestamp: number = 0;

	@Column({ type: 'bigint', unsigned: true })
	userId!: number;

	@ManyToOne(() => User, (user) => user.goals)
	user!: User;
}