import React from 'react'
import './Search.css'


const Search = () => {

  return (
    <>
      <form className='form__search'>
        <input className='input__text-search' type="text" placeholder="Buscar" />
      </form>
    </>
  )
}

export default Search