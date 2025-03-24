import React from "react";

const Footer = () => {
    const to_day = new Date();
    const year = to_day.getFullYear();
    return (
        <>
        <div className="bg-gray-900 text-white text-xm h-15 flex justify-center items-center">
         
                {" "}
                <p>
                    &copy; {year} Desarrollado por Jorge R. Sepúlveda Turpie -
                    Para el área de Operaciones Televisión.
                </p>
        </div>
        </>
    );
};

export default Footer;
