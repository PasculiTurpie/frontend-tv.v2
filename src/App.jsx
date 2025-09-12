import { Route, Routes } from "react-router-dom";
import "./App.css";
import "./styles.css";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Home from "./pages/Home/Home";
import Layout from "./Layout/Layout";
import NotFound from "./pages/NotFound/NotFound";
import SatelliteForm from "./pages/Satellite/SatelliteForm";
import { SatelliteList } from "./pages/Satellite/SatelliteList";
import IrdForm from "./pages/Ird/IrdForm";
import IrdListar from "./pages/Ird/IrdListar";
import RegisterUser from "./pages/User/RegisterUser";
import ListarUsers from "./pages/User/ListarUsers";
import Login from "./components/Login/Login";
import DetailCard from "./components/DatailCard/DetailCard";
import Diagrama from "./components/Diagrama/Diagrama";
import ListarDcm from "./pages/Dcm/ListarDcm";
import FormDcm from "./pages/Dcm/FormDcm";
import ListarEncoderTitan from "./pages/EncoderTitan/ListarEncoderTitan";
import FormEncoderTitan from "./pages/EncoderTitan/FormEncoderTitan";
import ListarDcmVmx from "./pages/DcmVmx/ListarDcmVmx";
import FormDcmVmx from "./pages/DcmVmx/FormDcmVmx";
import RtesVmxListar from "./pages/RtesVmx/RtesVmxListar";
import RtesVmxForm from "./pages/RtesVmx/RtesVmxForm";
import FormSwitch from "./pages/Switch/FormSwitch";
import ListarSwitch from "./pages/Switch/ListarSwitch";
import NodoListar from "./components/Nodo/NodoListar";
import Channel from "./pages/Channel.jsx/Channel";
import ChannelList from "./pages/Channel.jsx/ChannelList";
import Equipment from "./pages/Equipment/Equipment";
import ListEquipment from "./pages/Equipment/ListEquipment";
import Contacto from "./pages/Contacto/Contacto";
import ContactoList from "./pages/Contacto/ContactoList";
import SignalContact from "./pages/SignalContact/SignalContact";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import SearchFilter from "./components/SearchFilter/SearchFilter";
import ChannelDiagram from "./pages/ChannelDiagram/ChannelDiagram";
import ChannelForm from "./pages/ChannelDiagram/ChannelForm";
import ChannelEditor from "./pages/ChannelDiagram/ChannelEditor";
import ChannelListDiagram from "./pages/ChannelDiagram/ChannelListDiagram";
import Diagram from "./components/Diagrama/Diagram";
import AuditLogPage from "./pages/Audit/AuditLogPage";
import { useEffect } from "react";
import api from "../src/utils/api";

const App = () => {
    useEffect(() => {
        // 🔐 leer token al arrancar
        const token = localStorage.getItem("auth_token");
        if (token) {
            // 🧩 reinyectar Authorization en axios
            api._axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
    }, []);
    return (
        <>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="/auth/login" element={<Login />} />
                    <Route path="/search" element={<SearchFilter />} />
                    <Route path="/signal/:id" element={<DetailCard />} />
                    <Route path="/diagrama/:id" element={<Diagrama />} />
                    
                    <Route element={<ProtectedRoute />}>
                        <Route path="/auth/logout" element={<Login />} />
                        <Route path="/satelite" element={<SatelliteForm />} />
                        <Route
                            path="/listar-satelite"
                            element={<SatelliteList />}
                        />
                        <Route path="/ird" element={<IrdForm />} />

                        <Route path="/listar-ird" element={<IrdListar />} />

                        <Route
                            path="/registrar-user"
                            element={<RegisterUser />}
                        />
                        <Route path="/listar-user" element={<ListarUsers />} />
                        <Route path="/dcm-listar" element={<ListarDcm />} />
                        <Route path="/dcm" element={<FormDcm />} />
                        <Route
                            path="/listar-titan"
                            element={<ListarEncoderTitan />}
                        />
                        <Route path="/titan" element={<FormEncoderTitan />} />
                        <Route
                            path="/listar-dcmVmx"
                            element={<ListarDcmVmx />}
                        />
                        <Route path="/dcmVmx" element={<FormDcmVmx />} />
                        <Route path="/rtesVmx" element={<RtesVmxForm />} />
                        <Route
                            path="/rtesVmx-listar"
                            element={<RtesVmxListar />}
                        />
                        <Route path="/switch" element={<FormSwitch />} />
                        <Route
                            path="/switch-listar"
                            element={<ListarSwitch />}
                        />
                        <Route path="/channel-form" element={<ChannelForm />} />
                        <Route path="/channel-editor" element={<ChannelEditor />} />
                       
                        
                        <Route path="/nodo-listar" element={<NodoListar />} />
                        <Route path="/channel" element={<Channel />} />
                        <Route path="/channel-list" element={<ChannelList />} />
                        <Route path="/channel_diagram-list" element={<ChannelListDiagram />} />
                        {/* Crear */}
                        <Route path="/channels/new" element={<ChannelForm />} />

                        {/* Editar */}
                        
                        <Route path="/equipment" element={<Equipment />} />
                        <Route
                            path="/equipment-list"
                            element={<ListEquipment />}
                        />
                        <Route path="/contact" element={<Contacto />} />
                        <Route
                            path="/contact-list"
                            element={<ContactoList />}
                        />
                        <Route
                            path="/signal-contact"
                            element={<SignalContact />}
                        />
                        <Route path="/audit-logs" element={<AuditLogPage />} />
                    </Route>
                    <Route path='/diagram' element={<Diagram />}/>
                    <Route path="/channels/:id" element={<ChannelDiagram />} />
                   
                </Route>
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
};
export default App;