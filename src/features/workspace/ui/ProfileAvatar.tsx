import { useAvatar } from '../model/useAvatar'
export function ProfileAvatar({ initials }: {initials:string}) {
  const dataUrl=useAvatar()
  return dataUrl?<img src={dataUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'inherit'}}/>:<span>{initials}</span>
}
