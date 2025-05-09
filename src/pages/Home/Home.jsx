import React from "react";
import "./Home.css";
import signal from "../../utils/contants";
const Home = () => {
    console.log(signal);

    return (
        <div className="outlet-main">
            {signal.map((signalItem) => {
                return (
                    <>
                        <div className="card__container" key={signalItem.id}>
                            <h3>{signalItem.nameChannel}</h3>
                            <h4>{signalItem.numberChannel}</h4>
                            <img
                                className="card__logo"
                                src={signalItem.logoChannel}
                            />
                            <p>{`Severidad: ${signalItem.severidadChannel}`}</p>
                            <p>{signalItem.satelite.nameSatelite}</p>
                        </div>
                    </>
                );
            })}
        </div>
    );
};

export default Home;
