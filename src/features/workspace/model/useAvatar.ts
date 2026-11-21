import { useEffect } from 'react'
import { useResource } from './useResource'
export function useAvatar() {
  const resource=useResource<{dataUrl:string|null}>('/api/settings/avatar')
  useEffect(()=>{
    const update=()=>resource.reload()
    window.addEventListener('flenta-avatar-updated',update)
    return()=>window.removeEventListener('flenta-avatar-updated',update)
  },[resource.reload])
  return resource.state.status==='ready'?resource.state.data.dataUrl:null
}
