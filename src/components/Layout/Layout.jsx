import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "../Footer/Footer";
import Header from "../Header/Header";
import Nav from "../Nav/Nav";
import './Layout.css'

const Layout = () => {
    return (
        <>
            <Header />
            <Nav />
            <Outlet />
            <Footer />
        </>
    );
};

export default Layout;
