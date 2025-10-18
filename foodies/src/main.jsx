import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

// Bootstrap & Bootstrap Icons
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { StoreContextProivder } from './context/StoreContext.jsx';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <StoreContextProivder>
      <App />
    </StoreContextProivder>
  </BrowserRouter>
);
