import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * CREATE TABLE `checkpoints` (
 * 	`id` INT(10) NOT NULL AUTO_INCREMENT,
 * 	`goalId` INT(10) NULL DEFAULT NULL,
 * 	`name` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
 * 	`status` TINYINT(1) NULL DEFAULT '0',
 * 	`user` INT(10) NULL DEFAULT NULL,
 * 	`time` INT(10) NULL DEFAULT NULL,
 * 	PRIMARY KEY (`id`) USING BTREE,
 * 	INDEX `user_time` (`user`, `time`) USING BTREE,
 * 	INDEX `user_goal` (`user`, `goalId`) USING BTREE
 * )
 * COLLATE='utf8mb4_0900_ai_ci'
 * ENGINE=InnoDB
 * ;
 */

@Entity({ name: 'checkpoints' })
export class Checkpoint {
	@PrimaryGeneratedColumn()
	id?: number;

	@Column()
	goalId?: string;

	@Column()
	name?: string;

	@Column()
	status?: boolean;

	@Column()
	user?: number;

	@Column()
	time?: number;
}