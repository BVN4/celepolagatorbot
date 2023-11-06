import { Goal } from '../Entity/Goal';

export class GoalsDecMap extends Map<number, string | null>
{
	public static fromEntities (goals: Goal[] = []): GoalsDecMap
	{
		const map = new GoalsDecMap();

		for (const goal of goals) {
			map.set(goal.percent, goal.name);
		}

		return map;
	}
}