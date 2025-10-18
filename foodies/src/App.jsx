import {Routes,Route} from 'react-router-dom'
import Menubar from './components/Menubar/Menubar'
import Home from './pages/Home/Home'
import ExploreFood from './pages/explore food/ExploreFood'
import ContactUs from './pages/contact/Contact'
import FoodDetails from './pages/FoodDetails/FoodDetails'
import Cart from './pages/cart/Cart'
import PlaceOrder from './pages/place-order/PlaceOrder'
import Login from './components/login/Login'
import Register from './components/register/Register'
import { ToastContainer} from 'react-toastify';
import Footer from "./components/footer/Footer";
import MyOrder from "./pages/MyOrder/MyOrder";
const App = () => {
  return (
    <div>
      
      <Menubar />
        <ToastContainer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/cart" element={<Cart/>} />
        <Route path="/explore" element={<ExploreFood />} />
        <Route path="/food/:id" element={<FoodDetails />} />
        <Route path="/order" element={<PlaceOrder/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
          <Route path="/myorders" element={<MyOrder/>} />
      </Routes>
        <Footer />
    </div>
  )
}

export default App