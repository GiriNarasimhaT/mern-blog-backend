import { Outlet } from "react-router-dom";
import Header from "./Header";
import { ToastContainer } from 'react-toastify';
import Footer from "./Footer";

function Layout() {
    
    return ( 
        <>
            <ToastContainer position="top-center" pauseOnFocusLoss={false}/>
            <Header/>
            <div className="body-div">
                <Outlet/>
            </div>
            <Footer/>
        </>
     );
}

export default Layout;