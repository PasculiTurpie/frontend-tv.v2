import { Route, Routes } from "react-router-dom";
import "./App.css";
import Footer from "./components/Footer/Footer";
import Header from './components/Header/Header'
import Nav from './components/Nav/Nav'
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";

const App = () => {

    return (
        <>
            <Header />
            <Nav />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
            </Routes>
            <Footer />
        </>
    );
};

export default App;
