import React from 'react'
import ModalComponent from '../ModalComponent/ModalComponent'

const ModalUser = () => {
  return (
    <>
      <ModalComponent >
        <h4>Titulo</h4>
        <div className="form__group">
          <label
            htmlFor="satelliteName"
            className="form__group-label"
          >
            Nombre usauario
            <br />
            <input
              type="text"
              className="form__group-input"
              placeholder="Nombre"
              name="satelliteName"
            />
          </label>
          <div className="form__group-error"></div>
        </div>
        <div className="form__group">
          <label
            htmlFor="satelliteName"
            className="form__group-label"
          >
            Email
            <br />
            <input
              type="text"
              className="form__group-input"
              placeholder="Nombre"
              name="satelliteName"
            />
          </label>
          <div className="form__group-error"></div>
        </div>
        <div className="form__group">
          <label
            htmlFor="satelliteName"
            className="form__group-label"
          >
            Avatar
            <br />
            <input
              type="text"
              className="form__group-input"
              placeholder="Nombre"
              name="satelliteName"
            />
          </label>
          <div className="form__group-error"></div>
        </div>
        <div className="form__group">
          <label
            htmlFor="satelliteName"
            className="form__group-label"
          >
            Password
            <br />
            <input
              type="text"
              className="form__group-input"
              placeholder="Nombre"
              name="satelliteName"
            />
          </label>
          <div className="form__group-error"></div>
        </div>
        <div className="form__group">
          <label
            htmlFor="satelliteName"
            className="form__group-label"
          >
            Confirmar password
            <br />
            <input
              type="text"
              className="form__group-input"
              placeholder="Nombre"
              name="satelliteName"
            />
          </label>
          <div className="form__group-error"></div>
        </div>
        <div className="form__group">
          <label
            htmlFor="satelliteName"
            className="form__group-label"
          >
            Rol
            <br />
            <slect type="select" className="form__group-input">
              <option value="admin">admin</option>
              <option value="user">user</option>
            </slect>
          </label>
          <div className="form__group-error"></div>
        </div>
        </ModalComponent>
    </>
  )
}

export default ModalUser