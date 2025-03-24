import React from 'react'

const CardPro = () => {
  return (
    <>      

    <div class="max-w-xs w-full rounded-xl shadow-xl overflow-hidden bg-white border border-gray-300">

        <div class="bg-gradient-to-r from-blue-600 to-teal-500 text-white text-center p-4 font-semibold text-lg uppercase">
            Nombre Canal
        </div>
        

        <div class="bg-gray-100 text-center py-3 text-gray-700 font-medium text-sm tracking-wide">
            Sur: <span class="text-blue-600 font-semibold">18</span>  |  Norte: <span class="text-blue-600 font-semibold">22</span>
        </div>
        

        <div class="flex items-center justify-center py-6 px-4 bg-white">
            <img src="https://upload.wikimedia.org/wikipedia/commons/3/3a/DreamWorks_Animation_SKG_logo.svg" 
                 alt="DreamWorks Logo" class="h-20" />
        </div>
        

        <div class="bg-gradient-to-r from-orange-500 to-yellow-400 text-center py-4 relative">
            <span class="inline-block bg-red-600 text-white font-bold text-sm px-5 py-2 rounded-full shadow-lg">
                Sev. 3
            </span>
        </div>
    </div>

    </>
  )
}

export default CardPro