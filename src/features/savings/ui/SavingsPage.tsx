import { useDashboard } from '../../dashboard/model/useDashboard'
import { Feedback } from '../../dashboard/ui/DashboardLayout'
import { WorkspaceLayout } from '../../workspace/ui/WorkspaceLayout'
import { SavingsPanel } from './SavingsPanel'

export function SavingsPage() {
  const model = useDashboard()
  return <WorkspaceLayout section="savings" title={model.text('Savings', 'Накопичення')} subtitle={model.text('Make your next goal a little closer.', 'Наближайся до своєї наступної мети.')}>
    <Feedback model={model}/><SavingsPanel model={model}/>
  </WorkspaceLayout>
}
