import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiRequest } from '../../auth/api/httpClient'
import { useWorkspaceText } from '../../workspace/model/useWorkspaceText'
import { WorkspaceLayout } from '../../workspace/ui/WorkspaceLayout'
import { EmptyState, SoonBadge } from '../../workspace/ui/WorkspaceControls'
import { Icon } from '../../workspace/ui/Icon'
import ui from '../../workspace/ui/Workspace.module.css'
import { FaqAccordion } from './FaqAccordion'
import { faq, type FaqTopic } from './supportCopy'
import styles from './Support.module.css'

type ServiceState = 'checking' | 'up' | 'down'

function ServiceStatus() {
  const { text: t } = useWorkspaceText()
  const [state, setState] = useState<ServiceState>('checking')
  useEffect(() => {
    let active = true
    apiRequest<{ status: string }>('/api/status')
      .then(result => { if (active) setState(result.status === 'ok' ? 'up' : 'down') })
      .catch(() => { if (active) setState('down') })
    return () => { active = false }
  }, [])
  const label = { checking: t('Checking service status…', 'Перевіряємо стан сервісу…'), up: t('All systems operational', 'Усі системи працюють'), down: t('Service is unavailable', 'Сервіс недоступний') }[state]
  return <span role="status" className={`${styles.status} ${state === 'down' ? styles.statusDown : state === 'checking' ? styles.statusUnknown : ''}`}>●&nbsp; {label}</span>
}

function SupportContent({ initialQuery }: { initialQuery: string }) {
  const { text: t } = useWorkspaceText()
  const [query, setQuery] = useState(initialQuery)
  const [topic, setTopic] = useState<FaqTopic | 'all'>('all')
  const needle = query.trim().toLowerCase()
  const entries = faq.filter(entry => (topic === 'all' || entry.topic === topic)
    && (!needle || [...entry.question, ...entry.answer].some(part => part.toLowerCase().includes(needle))))
  const topics: { id: FaqTopic | 'all'; label: string }[] = [
    { id: 'all', label: t('All topics', 'Усі теми') }, { id: 'cards', label: t('Cards', 'Картки') },
    { id: 'transfers', label: t('Transfers', 'Перекази') }, { id: 'account', label: t('Account', 'Обліковий запис') },
  ]
  return <>
    <section className={`${ui.panel} ${ui.panelHighlight} ${styles.hero}`}>
      <div><h2>{t('How can we help?', 'Чим допомогти?')}</h2><p>{t('Find answers and get back to what matters.', 'Знайди відповідь і повертайся до важливого.')}</p></div>
      <label className={styles.heroSearch}><Icon name="search" size={18}/><span className={ui.srOnly}>{t('Search questions', 'Пошук питань')}</span>
        <input type="search" value={query} maxLength={100} onChange={e => setQuery(e.target.value)} placeholder={t('Search questions, topics or keywords', 'Шукай питання, теми або ключові слова')}/>
      </label>
    </section>
    <div className={styles.grid}>
      <section className={ui.panel} aria-labelledby="faq-title">
        <div className={ui.panelHeader}><h2 id="faq-title">{t('Frequently asked questions', 'Часті питання')}</h2></div>
        <div className={`${ui.segmented} ${styles.topics}`} role="group" aria-label={t('Topics', 'Теми')}>
          {topics.map(item => <button key={item.id} type="button" className={ui.segment} aria-pressed={topic === item.id} onClick={() => setTopic(item.id)}>{item.label}</button>)}
        </div>
        {entries.length ? <FaqAccordion key={`${topic}:${needle}`} entries={entries} t={t}/>
          : <EmptyState icon={<Icon name="search"/>} title={t('Nothing found', 'Нічого не знайдено')}>{t('Try another word or choose a different topic.', 'Спробуй інше слово або обери іншу тему.')}</EmptyState>}
      </section>
      <div className={styles.side}>
        <section className={`${ui.panel} ${styles.contact}`}>
          <div className={ui.panelHeader}><h2>{t('Let’s talk', 'Поговорімо')}</h2></div>
          <p>{t('Live chat and call-backs are on the way.', 'Онлайн-чат і зворотний дзвінок незабаром.')}</p>
          <button type="button" className={ui.button} disabled><Icon name="help" size={18}/>{t('Start a live chat', 'Почати онлайн-чат')}<SoonBadge/></button>
          <button type="button" className={ui.button} disabled><Icon name="phone" size={18}/>{t('Request a call', 'Замовити дзвінок')}<SoonBadge/></button>
        </section>
        <section className={ui.panel}>
          <div className={ui.panelHeader}><h2>{t('Your requests', 'Твої звернення')}</h2><SoonBadge/></div>
          <EmptyState icon={<Icon name="statement"/>} title={t('No requests yet', 'Звернень поки немає')}>{t('Your conversations with our team will appear here.', 'Тут з’являться твої звернення до команди.')}</EmptyState>
        </section>
      </div>
    </div>
  </>
}

export function SupportPage() {
  const { text: t } = useWorkspaceText()
  const [params] = useSearchParams()
  const q = params.get('q') || ''
  return <WorkspaceLayout section="support" title={t('Support', 'Допомога')} subtitle={t('A little help, whenever you need it.', 'Трохи допомоги, коли вона потрібна.')} actions={<ServiceStatus/>}>
    <SupportContent key={q} initialQuery={q}/>
  </WorkspaceLayout>
}
