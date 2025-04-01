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
        <h1 className='title-login'> Login</h1>
      <div className='container-login'>
        <form className='form-login' onSubmit={handleOnSubmit}>
          <label className='label-login'>Usuario:</label>
          <input type='text' className='input-login' placeholder='username' name='name' onChange={inputOnChange} />
          <span className='error-input'>Error</span>
          <br />
          <label className='label-login'>Contraseña:</label>
          <input type='password' className='input-login' placeholder='password' name='password' onChange={inputOnChange} />
          <span className='error-input'>Error</span>
          <br />
          <button type='submit' className='button-login' >Login</button>
          <br />
        </form>

    </div>
    </>
  )
}

export default Login