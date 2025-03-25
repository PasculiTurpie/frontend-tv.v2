import React from 'react'
import './Search.css'

const Search = () => {
  return (
    <div className='search'>
        <input className='text-gray-800 text-xs outline-none bg-white rounded-md h-6 px-4' type="text" placeholder="Search..." />
    </div>
  )
}

export default Search