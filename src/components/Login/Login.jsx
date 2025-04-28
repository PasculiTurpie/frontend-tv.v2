import React, { useContext, useEffect } from 'react'
import './Login.css'
import { UserContext } from '../context/UserContext'
import { Navigate } from "react-router-dom";


const Login = () => {

  const { user } = useContext(UserContext);


  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted')
  }

  
  useEffect(() => {
    if (!user) {
      return <Navigate to="/login" />;
    }

    return children;

      
  },[])

  return (
    <>
      <form className="form" onSubmit={handleSubmit}>
        <h1 className="form__titulo">Login</h1>
        <div className="form__group">
          <label htmlFor="username" className='form__group-label'>Username:</label>
          <input className='form__group-input' type="text" name="username" id='username' />
          <span className="form__group-error">Campo obligatorio</span>
        </div>
        <div className="form__group">
          <label htmlFor="password" className='form__group-label'>Password:</label>
          <input className='form__group-input' type="text" name="password" id='password' />
          <span className="form__group-error">Campo obligatorio</span>
        </div>
        <button className='btn btn-success' type="submit">Enviar</button>
      </form>
    </>
  )
}

export default Login