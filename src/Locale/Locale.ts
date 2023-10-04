import ru from '../../locales/ru.json';

interface LocaleLangMap {
	[lang: string]: LocaleTexts;
}

interface LocaleTexts {
	[key: string]: string;
}

export class Locale {

	protected static instance: Locale | null = null;

	public static readonly DEFAULT_LANG = 'ru';

	protected langMap: LocaleLangMap = {
		ru: ru
	};

	protected constructor () {}

	protected static init (): Locale {
		return new Locale();
	}

	public static getInstance (): Locale {
		if (!this.instance) {
			this.instance = this.init();
		}

		return this.instance;
	}

	public getTexts (lang: string = Locale.DEFAULT_LANG): LocaleTexts {
		return this.langMap[lang];
	}

	public get (key: string, lang: string = Locale.DEFAULT_LANG): string {
		const texts = this.getTexts(lang);

		return texts[key] ?? key;
	}

}