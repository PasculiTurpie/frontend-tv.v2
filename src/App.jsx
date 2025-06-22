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
import Diag from "./components/Diagrama/Diag";
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
const App = () => {
    return (
        <>
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
                    
                    <Route path="/signal" element={<AddSignal />} />
                    <Route path="/signal/:id" element={<DetailCard />} />
                    <Route path="/diagrama/:id" element={<Diagrama />} />
                </Route>
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
};
export default App;
