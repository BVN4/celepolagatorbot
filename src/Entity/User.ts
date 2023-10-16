import { Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Goal } from './Goal';

@Entity({ name: 'g_users' })
export class User
{
	@PrimaryColumn({ type: 'bigint', unsigned: true })
	id!: number;

	@OneToMany(() => Goal, (goal) => goal.user)
	goals!: Goal[];
}