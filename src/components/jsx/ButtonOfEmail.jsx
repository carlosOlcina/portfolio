import { useState } from 'preact/hooks'
import { CopiedMessage } from './CopiedMessage'
import './css/copiedMessage.css'
import { ErrorMessage } from './ErrorMessage'

export function ButtonOfEmail({children}){
  const [message, setmessage] = useState(false)
  const [visible, setVisible] = useState(false);
  
  const copyToClipBoard = async ()=>{
    try{
    await navigator.clipboard.writeText("carlosolcinadev@gmail.com")

  } catch{
    setmessage('error')
    return false
  }
  setmessage(true)
  setTimeout(()=>{
    setmessage(false)
  }, 750)

  }
  return(
    <>
      <li className="button-of-contact">
        <a onClick={copyToClipBoard}>
          {children}
        </a>
      </li>
        {
          message ? (message === 'error' ? <ErrorMessage/> : <CopiedMessage/>) : false
        }
    </>
  )
}
// 