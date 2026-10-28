import { useTranslation } from '../../../localization/index';
import { useTheme } from '../../hooks/useTheme';

import type { Theme } from '../../types';

import styles from './ThemeSwitcher.module.css';



function ThemeSwitcher()
{
	const { translate } = useTranslation();
	const { theme, setTheme } = useTheme();



	return (
		<select className={styles.select} value={theme} onChange={(event) => setTheme(event.target.value as Theme)} aria-label={translate('theme.title')}>
			<option value="light">{translate('theme.light')}</option>
			<option value="dark">{translate('theme.dark')}</option>
			<option value="system">{translate('theme.system')}</option>
		</select>
	);
}



export { ThemeSwitcher };