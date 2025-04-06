import React from 'react'
import './FormSatellite.css'

const FormSatellite = () => {
  return (
    <>
      <form className='container-form'>
        <h2 className='form-title'>Formulario</h2>
        <div className='group-input'>
          <label className='group-input-label' htmlFor='name'>Nombre</label>
          <input className='group-input-input' type='text' name='name' />
          <span className='group-input-error'>Campo obligatorio</span>
        </div>
        <div className='group-input'>
          <label className='group-input-label' htmlFor='lastname'>Apellido</label>
          <input className='group-input-input' type='text' name='lastname' />
          <span className='group-input-error'>Campo obligatorio</span>
        </div>
        <div className='group-input'>
          <label className='group-input-label' htmlFor='email'>Email</label>
          <input className='group-input-input' type='text' name='email' />
          <span className='group-input-error'>Campo obligatorio</span>
        </div>
        <div className='group-input'>
          <label className='group-input-label' htmlFor='email'>Select</label>
          <select className='group-input-select'>
            <option className='group-input-option' value="option1">Option 1</option>
            <option className='group-input-option' value="option2">Option 2</option>
            <option className='group-input-option' value="option3">Option 3</option>
          </select>
          <span className='group-input-error'>Campo obligatorio</span>
        </div>
        
        <button className='btn success'  type='submit'>Enviar</button>
      </form>
    </>
  )
}

export default FormSatellite