import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home/Home";
import Layout from "./Layout/Layout";
import Admin from "./pages/Admin/Admin";
import NotFound from "./pages/NotFound/NotFound";

const App = () => {
    return (
        <>
            
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="/login" element={<Admin />} />
                </Route>
                <Route path="*" element={<NotFound/>} />
            </Routes>
            
        </>
    );
};

export default App;
