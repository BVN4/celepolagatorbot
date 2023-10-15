import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import { ConfigFactory } from '../Config/ConfigFactory';
import { ControllerFactory } from '../Controller/ControllerFactory';
import { LocaleFactory } from '../Locale/LocaleFactory';
import { SystemFactory } from './SystemFactory';
import { ServiceFactory } from '../Service/ServiceFactory';
import { ViewFactory } from '../View/ViewFactory';

export class System {

	protected static instanceMap = new Map();
	protected static factoryMap: Map<any, any> = new Map([
		...(new ConfigFactory).init(),
		...(new ControllerFactory).init(),
		...(new LocaleFactory).init(),
		...(new SystemFactory).init(),
		...(new ServiceFactory).init(),
		...(new ViewFactory).init()
	]);

	public static get<I extends ObjectLiteral> (c: new (...args: any) => I): I {
		let instance: I | undefined = this.instanceMap.get(c);

		if (instance !== undefined) {
			return instance;
		}

		instance = this.factory(c);

		this.instanceMap.set(c, instance);

		return instance;
	}

	protected static factory<I extends ObjectLiteral> (c: new (...args: any) => I): I {
		const factory: (() => I) | undefined = this.factoryMap.get(c);

		if (factory === undefined) {
			throw new Error('Class ' + c + ' not factory');
		}

		return factory();
	}
}