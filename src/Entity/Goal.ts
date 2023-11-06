import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from './User';
import { Point } from './Point';

@Entity({ name: 'goals' })
export class Goal extends Point
{
	@Column({ type: 'int', unsigned: true, default: 0 })
	percent: number = 0;

	@ManyToOne(() => User, (user) => user.goals)
	user!: User;
}