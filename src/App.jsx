import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home/Home";
import Layout from "./Layout/Layout";
import Admin from "./pages/Admin/Admin";
import NotFound from "./pages/NotFound/NotFound";
import { useState } from "react";
import SatelliteForm from "./pages/Satellite/SatelliteForm";
import { SatelliteList } from "./pages/Satellite/SatelliteList";

const App = () => {

    const user = {
        name: "Andrea Bustos", profilePicture:"https://media.licdn.com/dms/image/v2/D4E03AQHNis1IfH_fsw/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1725648714099?e=1750896000&v=beta&t=uLT2rKQ9zh74Tr08P5QhPEWgfqcUM9AMH0rqwoYyjao", email: "jorge.sepulveda@grupogtd.com", role: "admin"
    }
    

    const [role, setRole] = useState(`${user.role}`)

    return (
        <>
            
            <Routes>
                <Route path="/" element={<Layout role={role} user={user} />}>
                    <Route index element={<Home />} />
                    <Route path="/login" element={<Admin />} />
                    <Route path="/satelite" element={<SatelliteForm />} />
                    <Route path="/listar-satelite" element={<SatelliteList />} />
                </Route>
                <Route path="*" element={<NotFound/>} />
            </Routes>
            
        </>
    );
};

export default App;
