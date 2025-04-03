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
  },[])




    return (
        <>
            <Routes>
                <Route path="/" element={<Layout />}>
                <Route index element={<Card dataCard={dataCard} />}/>
                    <Route path="admin" element={<Login />} />
                    <Route path="contacto" element={<Main />} />
                    <Route path="diagram" element={<SignalFlow />} />
                    <Route path="formulario" element={<FormSatellite />} />
                </Route>
                    <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
};

export default App;
