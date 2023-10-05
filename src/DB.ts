import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';
import { QueryRunner } from 'typeorm/query-runner/QueryRunner';
import { EntityTarget } from 'typeorm/common/EntityTarget';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import { Repository } from 'typeorm/repository/Repository';
import { Config } from './Config/Config';
import { Goal } from './Entity/Goal';
import { Checkpoint } from './Entity/Checkpoint';
import { System } from './System/System';

export class DB {

	public static readonly TYPE = 'mysql';

	public static readonly entities = [
		Goal,
		Checkpoint
	];

	/** Коннект к БД */
	protected static source: DataSource;

	/**
	 * Инициализирует подключение к БД
	 */
	public static async init () {
		const config = System.get(Config);

		this.source = new DataSource({
			type: this.TYPE,
			host: config.getHostDB(),
			username: config.getUsernameDB(),
			password: config.getPasswordDB(),
			database: config.getDatabaseDB(),
			synchronize: true,
			logging: false,
			entities: this.entities
		});

		await this.source.initialize();
	}

	/** Возвращает билдер запросов */
	public static query<Entity extends ObjectLiteral> (
		target: EntityTarget<Entity>,
		alias?: string,
		queryRunner?: QueryRunner
	): SelectQueryBuilder<Entity> {
		return this.getRepository(target)
			.createQueryBuilder(alias, queryRunner);
	}

	public static getRepository<Entity extends ObjectLiteral> (
		target: EntityTarget<Entity>
	): Repository<Entity> {
		return this.source.getRepository(target);
	}

}
