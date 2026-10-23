import { useTranslation } from '../../hooks/useTranslation';

import { LANGUAGES } from "../../utils/languages";

import styles from './LanguageSwitcher.module.css';



function LanguageSwitcher()
{
	const { language, setLanguage } = useTranslation();

	return (
		<select
			className={styles.select} value={language}
			onChange=
			{
				(event) =>
				{
					const value = event.target.value;
					const foundLanguage = LANGUAGES.find((language) => language.reduction === value);

					if (foundLanguage) { setLanguage(foundLanguage.reduction); }
				}
			}
		>
			{
				LANGUAGES.map
				(
					(language) =>
					(
						<option key={language.reduction} value={language.reduction}>
							{language.nativeName}
						</option>
					)
				)
			}	
		</select>
	);
}



export { LanguageSwitcher };