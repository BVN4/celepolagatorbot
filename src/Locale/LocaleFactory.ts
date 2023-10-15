import { Factory, FactoryMap } from '../System/Factory';
import { ObjectLiteral } from 'typeorm';
import { Locale } from './Locale';

/**
 * Локализация бота - фикция, на деле, логика для нескольких языков не реализована.
 * Более того, сам бот пока не умеет определять язык и пока нет идей,
 * как это элегантно реализовать.
 */
export class LocaleFactory extends Factory
{
	public init<I extends ObjectLiteral> (): FactoryMap<I>
	{
		this.map.set(Locale, () => this.makeLocale());

		return this.map;
	}

	protected makeLocale (): Locale
	{
		return new Locale();
	}
}