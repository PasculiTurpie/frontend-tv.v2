import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header/Header";
import Nav from "../components/Nav/Nav";
import Footer from "../components/Footer/Footer";
import Sidebar from "../components/Sidebar/Sidebar";
import './Layout.css'

const Layout = ({user}) => {
    return (
        <>
            <Header />
            <Nav user={user} />
            <div className="outlet__main">
            {
                    user.role === 'admin' ? <Sidebar user={user} /> : ''
            }

            <Outlet/>
            </div>
            <Footer />
        </>
    );
};

export default Layout;
