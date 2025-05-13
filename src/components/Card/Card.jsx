import React, { useEffect, useState } from "react";
import "./Card.css";
/* import signal from "../../utils/contants"; */
import axios from "axios";

const Card = () => {
    /* console.log(signal); */

    const [signalTv, setSignalTv] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:3000/api/v2/signal").then((response) => {
            console.log(response.data);
            setSignalTv(response.data);
        });
    }, []);

    const handleclick = (e) => {
        const card = e.target.closest(".card__container"); // busca el contenedor más cercano
        const id = card?.dataset.id;
        console.log("ID:", id);
    };

    return (
        <>
            {signalTv.map((signalItem, index) => {
                return (
                    <div
                        className="card__container"
                        key={index}
                        data-id={signalItem._id}
                        onClick={handleclick}
                    >
                        <div className="card__group-item">
                            <h4 className="card_title">
                                {signalItem.nameChannel}
                            </h4>
                            <div className="card__number">
                                <h5 className="card__number-item">{`Norte: ${signalItem.numberChannelCn}`}</h5>

                                <h5 className="card__number-item">{`Sur: ${signalItem.numberChannelSur}`}</h5>
                            </div>
                        </div>
                        <img
                            className="card__logo"
                            src={signalItem.logoChannel}
                        />
                        <span className="card__severidad">{`Severidad: ${signalItem.severidadChannel}`}</span>
                        {/* <p>{signalItem.satelite.nameSatelite}</p> */}
                    </div>
                );
            })}
        </>
    );
};

export default Card;
