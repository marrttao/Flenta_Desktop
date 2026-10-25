import { LanguageSwitcher } from '../components/LanguageSwitcher/LanguageSwitcher'

import { useTranslation } from '../hooks/useTranslation'



function LocalizationTest()
{
	const { language, translate } = useTranslation();

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
			<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
				<span>Current language: {language}</span>
				<LanguageSwitcher/>
			</div>

			<div>testMessage: {translate('testMessage')}</div>
		</div>
	);
}



export { LocalizationTest };