import { Entity, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { Goal } from './Goal';
import { Quest } from './Quest';

@Entity({ name: 'g_users' })
export class User
{
	@PrimaryColumn({ type: 'bigint', unsigned: true })
	id!: number;

	@OneToMany(() => Goal, (goal) => goal.user, {
		nullable: true,
	})
	goals!: Goal[];

	@OneToMany(() => Quest, (quest) => quest.user, {
		nullable: true,
	})
	quests!: Quest[];
}