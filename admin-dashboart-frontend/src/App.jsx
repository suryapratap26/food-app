import { Routes ,Route} from "react-router-dom"
import AddFood from "./pages/addfoods/AddFood"
import Orders from "./pages/orders/Orders"
import ListFood from "./pages/Listfoods/ListFood"
import Menubar from "./components/menu-bar/Menubar"
import Sidebar from "./components/side-bar/Sidebar"
import { useState } from "react"
import { ToastContainer } from 'react-toastify';
 

const App = () => {

    const [sidebarVisible,setSidebarVisible]=useState(true);

    const toggleSidebar=()=>{
        setSidebarVisible(!sidebarVisible);
    }
  return (
   <div className="d-flex" id="wrapper">
                <Sidebar sidebarVisible={sidebarVisible}/>
           
            <div id="page-content-wrapper">
          
               
                <Menubar toggleSidebar={toggleSidebar} />
                <ToastContainer />
                <div className="container-fluid">
                   <Routes>
                    <Route path="/addfood" element={<AddFood />} />
                    <Route path="/listfoods" element={<ListFood />} />
                    <Route path="/orders" element={<Orders />} />
                     <Route path="/" element={<ListFood />} />
                   </Routes>
                </div>
            </div>
        </div>
      
  )
}

export default App