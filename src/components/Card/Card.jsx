import React, { useEffect, useState } from "react";
import "./Card.css";
/* import signal from "../../utils/contants"; */
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import api from '../../utils/api'

const Card = () => {
    const navigate = useNavigate();
    const location = useLocation()


    const [signalTv, setSignalTv] = useState([]);

    const getAllSignal = () =>{
api.getSignal().then((response) => {
            setSignalTv(response.data);
        })
    }

    useEffect(() => {
        refreshList()
    }, []);

    const refreshList = () =>{
        getAllSignal()
    }

    const handleclick = (e) => {
        const card = e.target.closest(".card__container"); // busca el contenedor más cercano
        const id = card?.dataset.id;
        if (id) {
            navigate(`/signal/${id}`); // redirige a otra vista
        }
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
                            <h4 className="card__title">
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
                        <div className="card__severidad">

                        <span>{signalItem.tipoTecnologia}</span><br />
                        <span>{`Severidad: ${signalItem.severidadChannel}`}</span>
                        </div>
                    </div>
                );
            })}
        </>
    );
};

export default Card;
