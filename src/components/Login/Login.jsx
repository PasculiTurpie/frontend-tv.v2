import React, { useState } from 'react'
import './Login.css'

const Login = () => {

  const [objData, setObjData] = useState({
    name: '',
    password:''
  })

  const [error, setError] = useState({})

  const inputOnChange = ({target:{value, name}}) => {
    let dataForm = {
      [name]: value
    }
    setObjData(
      {...objData, ...dataForm}
    )
    console.log(objData)
    }

  const handleOnSubmit = (e) => {
    e.preventDefault();  
    console.log(objData)
    }

  return (
    <>

      <div className='container-login'>
        <form className='container-form'>
          <h2 className='form-title'>Login</h2>
          <div className='group-input'>
            <label className='group-input-label' htmlFor='user'>Usuario</label>
            <input className='group-input-input' type='text' name='user' />
            <span className='group-input-error'>Campo obligatorio</span>
          </div>
          <div className='group-input'>
            <label className='group-input-label' htmlFor='password'>Contraseña</label>
            <input className='group-input-input' type='text' name='password' />
            <span className='group-input-error'>Campo obligatorio</span>
          </div>
          <button className='btn success' type='submit'>Enviar</button>
        </form>

    </div>
    </>
  )
}

export default Login