import React, { useEffect } from "react";
/* import Card from "../Card/Card"; */
import './Main.css'
import SignalFlow from "../SignalFlow/SignalFlow.jsx";
import api from '../../utils/api.js'


const Main = () => {


    const getEquipos = api._getEquipos()
        .then((response) => response.json())
        .then((data) => {
            console.log(data)
        })
        
    
    
    useEffect(() => {
        getEquipos
        
    }, []);


    return (
        <>
            <div className="main-container">
                <SignalFlow />
                {/*  <Card />
                <Card />
                <Card />
                <Card />
                <Card />
                <Card />
                <Card /> */}
            </div>
        </>
    );
};

export default Main;
