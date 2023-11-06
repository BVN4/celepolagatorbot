import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { PointStatusEnum } from '../Enum/PointStatusEnum';

export abstract class Point
{
	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	name!: string;

	@Column({ type: 'tinyint', default: PointStatusEnum.WAIT })
	status: PointStatusEnum = PointStatusEnum.WAIT;

	@Column({ type: 'bigint', unsigned: true })
	userId!: number;
}