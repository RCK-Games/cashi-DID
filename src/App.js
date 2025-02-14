import logo from './logo.svg';
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ElementContextRoute } from "./context/RouteContext";
import React, { useContext } from "react";
import Login from "./pages/Login"
import DIdAgentDemo from "./DidAgentDemo";
import './App.css';

function App() {
  const {route} = useContext(ElementContextRoute);

  let currentPage ;
  // eslint-disable-next-line default-case
  switch (route) {
    case "":
      currentPage = (<Login></Login>)
      break;
    case "Main":
      currentPage = (<></>)
      break;
    case "Login":
      currentPage = (<Login></Login>)
      break;
  }

  return (
    <div className="App">
      <DIdAgentDemo></DIdAgentDemo>
      <>{currentPage}</>
      
    </div>
  );
}


export default App;
