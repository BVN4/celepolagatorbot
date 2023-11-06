import ru from '../../locales/ru.json';

export interface LocaleLangMap
{
	[lang: string]: LocaleTexts;
}

export interface LocaleTexts
{
	[key: string]: string;
}

export interface ValueToPrepare
{
	[key: string]: string;
}

export class Locale
{
	public static readonly DEFAULT_LANG = 'ru';

	protected langMap: LocaleLangMap = {
		ru: ru
	};

	public getTexts (lang: string = Locale.DEFAULT_LANG): LocaleTexts
	{
		return this.langMap[lang];
	}

	public get (key: string, lang: string = Locale.DEFAULT_LANG): string
	{
		const texts = this.getTexts(lang);

		return texts[key] ?? key;
	}

	public prepare (
		key: string,
		values: ValueToPrepare = {},
		lang: string = Locale.DEFAULT_LANG
	): string {
		let text = this.get(key, lang);

		for (const key in values) {
			text = text.replace('%' + key + '%', values[key]);
		}

		return text;
	}
}