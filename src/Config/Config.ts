export class Config
{
	public constructor (
		protected token: string,
		protected hostDB: string = '',
		protected usernameDB: string = '',
		protected passwordDB: string = '',
		protected databaseDB: string = '',
		protected admins: number[] = []
	)
	{}

	public getToken (): string
	{
		return this.token;
	}

	public getHostDB (): string
	{
		return this.hostDB;
	}

	public getUsernameDB (): string
	{
		return this.usernameDB;
	}

	public getPasswordDB (): string
	{
		return this.passwordDB;
	}

	public getDatabaseDB (): string
	{
		return this.databaseDB;
	}

	public getAdmins (): number[]
	{
		return this.admins;
	}
}