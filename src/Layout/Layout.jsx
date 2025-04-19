import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header/Header";
import Nav from "../components/Nav/Nav";
import Footer from "../components/Footer/Footer";

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
