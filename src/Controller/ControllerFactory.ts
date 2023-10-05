import { Factory, FactoryMap } from '../System/Factory';
import { ObjectLiteral } from 'typeorm';
import { MainController } from './MainController';
import { DB } from '../DB';
import { Goal } from '../Entity/Goal';

export class ControllerFactory extends Factory {

	public init<I extends ObjectLiteral> (): FactoryMap<I> {
		this.map.set(MainController, () => this.makeMainController());

		return this.map;
	}

	protected makeMainController (): MainController {
		return new MainController(
			DB.getRepository(Goal)
		);
	}

}