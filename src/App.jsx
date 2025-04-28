import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home/Home";
import Layout from "./Layout/Layout";
import Admin from "./pages/Admin/Admin";
import NotFound from "./pages/NotFound/NotFound";
import SatelliteForm from "./pages/Satellite/SatelliteForm";
import { SatelliteList } from "./pages/Satellite/SatelliteList";
import IrdForm from "./pages/Ird/IrdForm";
import IrdListar from "./pages/Ird/IrdListar";
import { useContext } from "react";
import { UserContext } from "./components/context/UserContext";

const App = () => {

    
const {user} = useContext(UserContext)

console.log(user.role)
   

    return (
        <>
            
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="/login" element={<Admin />} />
                    <Route path="/satelite" element={<SatelliteForm />} />
                    <Route path="/listar-satelite" element={<SatelliteList />} />
                    <Route path="/ird" element={<IrdForm />} />
                    <Route path="/listar-ird" element={<IrdListar />} />
                </Route>
                <Route path="*" element={<NotFound/>} />
            </Routes>
            
        </>
    );
};

export default App;
