import React from "react";
import './Card.css'
import signal from "../../utils/contants";

const Card = () => {
    console.log(signal);

    return (
        <>
            {signal.map((signalItem, index) => {
                  return (<div className="card__container" key={index} value={signalItem.id}>
                        <h4>{signalItem.nameChannel}</h4>
                        <div className='card__number'>
                        <h5 className="card__number-item">{`Norte: ${signalItem.numberChannelCn}`}</h5>

                        <h5 className="card__number-item">{`Sur: ${signalItem.numberChannelSur}`}</h5>
                        </div>
                        <img
                            className="card__logo"
                            src={signalItem.logoChannel}
                        />
                        <p className="card__severidad">{`Severidad: ${signalItem.severidadChannel}`}</p>
                        {/* <p>{signalItem.satelite.nameSatelite}</p> */}
                    </div>)
            })}
        </>
    );
};

export default Card;
