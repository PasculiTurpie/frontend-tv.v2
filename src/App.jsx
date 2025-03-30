import { Route, Routes } from "react-router-dom";
import "./App.css";
import Card from "./components/Card/Card";

import Layout from "./components/Layout/Layout";
import NotFound from "./components/NotFound/NotFound";
import Admin from "./components/Admin/Admin";
import Contact from "./components/Contact/Contact";
import { useEffect, useState } from "react";

const App = () => {


  const [dataCard, setDataCard] = useState([])

  useEffect(() => {
    fetch('http://localhost:3000/api/v2/equipment')
       .then(response => response.json())
       .then(data => setDataCard(data))
       .catch(error => console.error('Error:', error))
       .finally(() => console.log('Fetch completed'))
  },[])




    return (
        <>
            <Routes>
                <Route path="/" element={<Layout />}>
                <Route index element={<Card dataCard={dataCard} />}/>
                    <Route path="admin" element={<Admin />} />
                    <Route path="contacto" element={<Contact />} />
                </Route>
                    <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
};

export default App;
