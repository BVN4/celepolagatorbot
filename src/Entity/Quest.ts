import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from './User';
import { Point } from './Point';

@Entity({ name: 'quests' })
export class Quest extends Point
{
	@Column({ type: 'bigint', unsigned: true, default: 0 })
	timestamp: number = 0;

	@ManyToOne(() => User, (user) => user.quests)
	user!: User;
}