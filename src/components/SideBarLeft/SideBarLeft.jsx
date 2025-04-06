import React from 'react'
import './SideBarLeft.css'
import { Link } from 'react-router-dom'

const SideBarLeft = () => {
  return (

    <>
      <div className='container-sidebar'>
        <ul>
          <li>IRD</li>
          <li>Encoder</li>
          <li><Link to='/satelite'>Satelite</Link></li>
          <li>DCM</li>
          <li>Switch</li>
          <li>Encriptador</li>
          <li>Router</li>
          
        </ul>
      </div>
    </>
  )
}

export default SideBarLeft