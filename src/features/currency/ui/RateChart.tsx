import styles from './Exchange.module.css'

export interface RateBar { currency: string; value: number }

/** Bar chart of today's official rates (UAH per unit) for the currencies the backend publishes. */
export function RateChart({ bars, caption, format }: { bars: RateBar[]; caption: string; format: (value: number) => string }) {
  const max = Math.max(...bars.map(bar => bar.value), 1)
  const ceiling = Math.ceil(max / 10) * 10 || 10
  const ticks = [1, 0.8, 0.6, 0.4, 0.2, 0].map(step => Math.round(ceiling * step))
  return <figure className={styles.chart}>
    <div className={styles.chartGrid}>
      <div className={styles.axis} aria-hidden="true">{ticks.map(tick => <span key={tick}>{tick}</span>)}</div>
      <div className={styles.bars} role="list">
        {bars.map(bar => <div key={bar.currency} role="listitem" className={styles.barSlot} aria-label={`${bar.currency}: ${format(bar.value)}`}>
          <span className={styles.barValue}>{format(bar.value)}</span>
          <span className={styles.bar} style={{ height: `${(bar.value / ceiling) * 100}%` }}/>
          <span className={styles.barLabel}>{bar.currency}</span>
        </div>)}
      </div>
    </div>
    <figcaption className={styles.legend}><span className={styles.legendSwatch}/>{caption}</figcaption>
  </figure>
}
