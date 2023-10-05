import { Factory, FactoryMap } from '../System/Factory';
import { ObjectLiteral } from 'typeorm';
import { Locale } from './Locale';

export class LocaleFactory extends Factory {

	public init<I extends ObjectLiteral> (): FactoryMap<I> {
		this.map.set(Locale, () => this.makeLocale());

		return this.map;
	}

	protected makeLocale (): Locale {
		return new Locale();
	}

}