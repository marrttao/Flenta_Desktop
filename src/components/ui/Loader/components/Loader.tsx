import styles from './Loader.module.css';



type LoaderSize = 'small' | 'medium' | 'large';



interface LoaderProps
{
	size?: LoaderSize;
	label?: string;
}



function Loader({ size = 'medium', label }: LoaderProps)
{
	return (
		<span className={`${styles.loader} ${styles[size]}`}>
			<span className={styles.spinning_ring}/>
			{label && <span className={styles.label}>{label}</span>}
		</span>
	);
}



export type { LoaderSize, LoaderProps };

export { Loader };