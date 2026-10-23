const LANGUAGES =
[
	{ "reduction": "en" , "name": "EN", "nativeName": "English" },
	{ "reduction": "pl" , "name": "PL", "nativeName": "Polski" },
	{ "reduction": "de" , "name": "DE", "nativeName": "Deutsch" },
	{ "reduction": "uk" , "name": "UA", "nativeName": "Українська" },
] as const;



type Language = typeof LANGUAGES[number]["reduction"];



const DEFAULT_LANGUAGE: Language = "en";



const isSupportedLanguage = (value: string): value is Language =>
	LANGUAGES.some((language) => language.reduction === value);



export { LANGUAGES, DEFAULT_LANGUAGE, isSupportedLanguage };
export type { Language };