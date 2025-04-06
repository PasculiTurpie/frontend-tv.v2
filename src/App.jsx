import { Route, Routes } from "react-router-dom";
import "./App.css";
import Card from "./components/Card/Card";
import SignalFlow from "./components/SignalFlow/SignalFlow";
import Layout from "./components/Layout/Layout";
import NotFound from "./components/NotFound/NotFound";
import Admin from "./components/Admin/Admin";
import Contact from "./components/Contact/Contact";
import { useEffect, useState } from "react";
import Login from "./components/Login/Login";
import axios from "axios";
import Main from "./components/Main/Main";
import FormSatellite from "./components/FormSatellite/FormSatellite";
import Ird from "./components/Ird/Ird";
import Encoder from "./components/Encoder/Encoder";
import Satellite from "./components/Satellite/Satellite";
import Dcm from "./components/Dcm/Dcm";
import Switch from "./components/Switch/Switch";
import Encriptador from "./components/Encriptador/Encriptador";
import Asr from "./components/Asr/Asr";
import Signal from "./components/Sitgnal/Signal";

const App = () => {


    const [dataCard, setDataCard] = useState([])

    useEffect(() => {
        axios.get('http://localhost:3000/api/v2/equipment')
            .then(response => {
                setDataCard(response.data)
            })
            .catch(error => {
                console.error(error);
            });
    }, [])

    return (
        <>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Card dataCard={dataCard} />} />
                    <Route path="admin" element={<Login />} />
                    <Route path="contacto" element={<Main />} />
                    <Route path="diagram" element={<SignalFlow />} />
                    <Route path="formulario" element={<FormSatellite />} />
                    <Route path="ird" element={<Ird />} />
                    <Route path="encoder" element={<Encoder />} />
                    <Route path="satelite" element={<Satellite />} />
                    <Route path="dcm" element={<Dcm />} />
                    <Route path="switch" element={<Switch />} />
                    <Route path="encriptador" element={<Encriptador />} />
                    <Route path="router" element={<Asr />} />
                    <Route path="signal" element={<Signal />} />
                </Route>
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
};

export default App;
