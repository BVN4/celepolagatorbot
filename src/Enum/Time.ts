export class Time
{
	public static readonly SECOND = 1000;
	public static readonly MINUTE = 60 * Time.SECOND;
	public static readonly HOUR = 60 * Time.MINUTE;
	public static readonly DAY = 24 * Time.HOUR;
	public static readonly WEEK = 7 * Time.DAY;
	public static readonly MONTH = 30 * Time.DAY;
	public static readonly YEAR = 12 * Time.MONTH;
}