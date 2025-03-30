import React from 'react'
import LossSignal from '../../../public/images/giphy.gif'
import './NotFound.css'
const NotFound = () => {
  return (
    <div className='container-loss'>
        <img style={{width:600, height:300}} src={LossSignal} alt='Error 404' className='w-screen h-screen object-cover' />
        <h1 className='text-center text-3xl text-gray-800'>Página no encontrada</h1>
        <p className='text-center text-lg text-gray-600'>Lo sentimos, pero la página que busca no existe.</p>
        <a href='/' className='text-center text-lg text-sky-600'>Volver al inicio</a>
    </div>
  )
}

export default NotFound