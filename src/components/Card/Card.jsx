import React from "react";
import "./Card.css";
const Card = ({dataCard}) => {
    console.log(dataCard)
    return (

        <>
        {
            !dataCard && <h2>Loading...</h2>
        }
        {
            dataCard.map((data) =>{
                return(
                    <div className="card ">
                        <div className="card-header">
                            <h2 className="card-header__title">{data.nombreEquipment}</h2>
                        </div>
                        <div className="card-number">
                            Sur:<span className="text-sky-600">{data.sur}</span>
                            Norte:<span className="text-sky-600">{data.norte}</span>
                        </div>
                        <div className="card-container-logo">
                            <img
                                className="card-logo"
                                src={data.urlImagen}
                                alt={data.nombreEquipment}
                            />
                        </div>
                        <div className="card-footer">
                            <p className="card-severidad">Sev. {data.description}</p>
                        </div>
                    </div>
                )


            })
           
        }
            
        </>
    );
};

export default Card;
