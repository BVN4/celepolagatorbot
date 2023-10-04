import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * CREATE TABLE `goals` (
 * 	`id` INT(10) NOT NULL AUTO_INCREMENT,
 * 	`name` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
 * 	`status` TINYINT(1) NULL DEFAULT '0',
 * 	`user` INT(10) NULL DEFAULT NULL,
 * 	PRIMARY KEY (`id`) USING BTREE,
 * 	INDEX `user` (`user`) USING BTREE
 * )
 * COLLATE='utf8mb4_0900_ai_ci'
 * ENGINE=InnoDB
 * ;
 */

@Entity({ name: 'goals' })
export class Goal {
	@PrimaryGeneratedColumn()
	id?: number;

	@Column()
	name?: string;

	@Column()
	status?: boolean;

	@Column()
	user?: number;
}