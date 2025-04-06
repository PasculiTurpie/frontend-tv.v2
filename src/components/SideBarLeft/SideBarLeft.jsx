import React from 'react'
import './SideBarLeft.css'
import { Link } from 'react-router-dom'

const SideBarLeft = () => {
  return (

    <>
      <div className='container-sidebar'>
        <ul>
          <li><Link to='ird' >IRD</Link></li>
          <li><Link to='encoder' >Encoder</Link></li>
          <li><Link to='satelite'>Satelite</Link></li>
          <li><Link to='dcm'>DCM</Link></li>
          <li><Link to='switch'>Switch</Link></li>
          <li><Link to='encriptador'>Encriptador</Link></li>
          <li><Link to='router'>Router</Link></li>
          <li><Link to='signal'>Señal</Link></li>
        </ul>
      </div>
    </>
  )
}

export default SideBarLeft