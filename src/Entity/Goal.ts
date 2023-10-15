import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';
import { GoalStatusEnum } from '../Enum/GoalStatusEnum';
import { GoalTypeEnum } from '../Enum/GoalTypeEnum';

/**
 * CREATE TABLE `goals` (
 * 	`id` INT(10) NOT NULL AUTO_INCREMENT,
 * 	`name` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
 * 	`status` TINYINT(3) NOT NULL DEFAULT '0',
 * 	`type` TINYINT(3) NOT NULL DEFAULT '0',
 * 	`timestamp` BIGINT(20) UNSIGNED NOT NULL DEFAULT '0',
 * 	`userId` INT(10) NOT NULL,
 * 	PRIMARY KEY (`id`) USING BTREE
 * )
 * COLLATE='utf8mb4_0900_ai_ci'
 * ENGINE=InnoDB
 * ;
 */

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

	@Column({ type: 'bigint', default: 0 })
	timestamp: number = 0;

	@Column()
	userId!: number;

	@ManyToOne(() => User, (user) => user.goals)
	user!: User;
}