import logo from './logo.svg';
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import {Login} from './pages/Login'
import './App.css';

function App() {
  return (
    <Router basename="/cashi-DID">
      <Routes>
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}


export default App;
