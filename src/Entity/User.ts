import { Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Goal } from './Goal';

/**
 * CREATE TABLE `g_users` (
 * 	`id` BIGINT(19) NOT NULL,
 * 	PRIMARY KEY (`id`) USING BTREE
 * )
 * COLLATE='utf8mb4_0900_ai_ci'
 * ENGINE=InnoDB
 * ;
 */

@Entity({ name: 'g_users' })
export class User
{
	@PrimaryColumn()
	id!: number;

	@OneToMany(() => Goal, (goal) => goal.user)
	goals!: Goal[];
}