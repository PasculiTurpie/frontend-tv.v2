import { Route, Routes } from "react-router-dom";
import "./App.css";
import './styles.css'
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
import AddSignal from "./pages/AddSignal/AddSignal";
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
import Diagram from "./components/Diagrama/Diagram";
import Nodo from "./components/Nodo/Nodo";
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


const App = () => {
    return (
        <>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/logout" element={<Login />} />

                    <Route
                        path="/satelite"
                        element={
                           /*  <ProtectedRoute> */
                                <SatelliteForm />
                            /* </ProtectedRoute> */
                        }
                    />
                    <Route
                        path="/listar-satelite"
                        element={
                           /*  <ProtectedRoute> */
                                <SatelliteList />
                           /*  </ProtectedRoute> */
                        }
                    />
                    <Route
                        path="/ird"
                        element={
                            /* <ProtectedRoute> */
                                <IrdForm />
                            /* </ProtectedRoute> */
                        }
                    />

                    <Route
                        path="/listar-ird"
                        element={
                            /* <ProtectedRoute> */
                                <IrdListar />
                            /* </ProtectedRoute> */
                        }
                    />

                    <Route
                        path="/registrar-user"
                        element={
                          /*   <ProtectedRoute> */
                                <RegisterUser />
                          /*   </ProtectedRoute> */
                        }
                    />
                    <Route
                        path="/listar-user"
                        element={
                         /*    <ProtectedRoute> */
                                <ListarUsers />
                        /*     </ProtectedRoute> */
                        }
                    />
                    <Route
                        path="/dcm-listar"
                        element={
                            /*    <ProtectedRoute> */
                            <ListarDcm />
                            /*     </ProtectedRoute> */
                        }
                    />
                    <Route
                        path="/dcm"
                        element={
                            /*    <ProtectedRoute> */
                            <FormDcm />
                            /*     </ProtectedRoute> */
                        }
                    />
                    <Route
                        path="/listar-titan"
                        element={
                            /*    <ProtectedRoute> */
                            <ListarEncoderTitan />
                            /*     </ProtectedRoute> */
                        }
                    />
                    <Route
                        path="/titan"
                        element={
                            /*    <ProtectedRoute> */
                            <FormEncoderTitan />
                            /*     </ProtectedRoute> */
                        }
                    />
                    <Route
                        path="/listar-dcmVmx"
                        element={
                            /*    <ProtectedRoute> */
                            <ListarDcmVmx />
                            /*     </ProtectedRoute> */
                        }
                    />
                    <Route
                        path="/dcmVmx"
                        element={
                            /*    <ProtectedRoute> */
                            <FormDcmVmx />
                            /*     </ProtectedRoute> */
                        }
                    />
                    <Route
                        path="/rtesVmx"
                        element={
                            /*    <ProtectedRoute> */
                            <RtesVmxForm />
                            /*     </ProtectedRoute> */
                        }
                    />
                    <Route
                        path="/rtesVmx-listar"
                        element={
                            /*    <ProtectedRoute> */
                            <RtesVmxListar />
                            /*     </ProtectedRoute> */
                        }
                    />
                    <Route
                        path="/switch"
                        element={
                            /*    <ProtectedRoute> */
                            <FormSwitch />
                            /*     </ProtectedRoute> */
                        }
                    />
                    <Route
                        path="/switch-listar"
                        element={
                            /*    <ProtectedRoute> */
                            <ListarSwitch />
                            /*     </ProtectedRoute> */
                        }
                    />
                    <Route
                        path="/diagram"
                        element={
                            /*    <ProtectedRoute> */
                            <Diagram />
                            /*     </ProtectedRoute> */
                        }
                    />
                    <Route
                        path="/nodo"
                        element={
                            /*    <ProtectedRoute> */
                            <Nodo />
                            /*     </ProtectedRoute> */
                        }
                    />
                    <Route
                        path="/nodo-listar"
                        element={
                            /*    <ProtectedRoute> */
                            <NodoListar />
                            /*     </ProtectedRoute> */
                        }
                    />
                    <Route
                        path="/channel"
                        element={
                            /*    <ProtectedRoute> */
                            <Channel />
                            /*     </ProtectedRoute> */
                        }
                    />
                    <Route
                        path="/channel-list"
                        element={
                            /*    <ProtectedRoute> */
                            <ChannelList />
                            /*     </ProtectedRoute> */
                        }
                    />
                    <Route
                        path="/equipment"
                        element={
                            /*    <ProtectedRoute> */
                            <Equipment />
                            /*     </ProtectedRoute> */
                        }
                    />
                    <Route
                        path="/equipment-list"
                        element={
                            /*    <ProtectedRoute> */
                            <ListEquipment />
                            /*     </ProtectedRoute> */
                        }
                    />
                    <Route
                        path="/contact"
                        element={
                            /*    <ProtectedRoute> */
                            <Contacto />
                            /*     </ProtectedRoute> */
                        }
                    />
                    <Route
                        path="/contact-list"
                        element={
                            /*    <ProtectedRoute> */
                            <ContactoList />
                            /*     </ProtectedRoute> */
                        }
                    />
                    <Route
                        path="/signal-contact"
                        element={
                            /*    <ProtectedRoute> */
                            <SignalContact />
                            /*     </ProtectedRoute> */
                        }
                    />
                    <Route path="/signal" element={<AddSignal />} />
                    <Route path="/search" element={<SearchFilter />}/>
                    <Route path="/signal/:id" element={<DetailCard />} />
                    <Route path="/diagrama/:id" element={<Diagrama />} />
                </Route>
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
};
export default App;
