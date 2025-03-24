import React from "react";
import "./Card.css";
const Card = () => {
    return (
        <>
            <div className="card ">
                <div className="card-header">
                    <div className="card-header__title">
                        <h2>AZ Mundo Internacional</h2>
                    </div>
                </div>
                <div className="card-number">
                    Sur:<span className="text-sky-600"> 18</span>
                    Norte:<span className="text-sky-600"> 22</span>
                </div>
                <div className="card-container-logo">
                    <img
                        className="card-logo"
                        src="https://i.ibb.co/KX2gxHz/Dreamworks.jpg"
                        alt=""
                        srcset=""
                    />
                </div>
                <div className="card-footer">
                    <p className="card-severidad">Sev. 3</p>
                </div>
            </div>
        </>
    );
};

export default Card;
