import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';

export type FactoryMap<I extends ObjectLiteral> = Map<new (...args: any) => I, () => I>

export abstract class Factory
{
	protected map = new Map();

	public abstract init<I extends ObjectLiteral> (): FactoryMap<I>;
}