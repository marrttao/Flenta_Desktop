import styles from './Tabs.module.css'



interface Tab
{
	key: string;
	label: string;
}

interface TabsProps
{
	tabs: Tab[];
	activeTab: string;

	onTabChange: (key: string) => void;
}



function Tabs({ tabs, activeTab, onTabChange }: TabsProps)
{
	return (
		<div className={styles.tabs_container}>
			{
				tabs.map
				(
					(tab) =>
					(
						<button key={tab.key} className={`${styles.tab} ${activeTab === tab.key ? styles.active : ''}`} onClick={() => onTabChange(tab.key)}>
							{tab.label}
						</button>
					)
				)
			}
		</div>
	);
}



export type { Tab, TabsProps };

export { Tabs };