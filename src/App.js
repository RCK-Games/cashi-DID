import { ElementContextRoute } from "./context/RouteContext";
import React, { useContext, useState, useRef } from "react";
import Login from "./pages/Login"
import './App.css';
import StreamingApi from '../src/components/Streaming/StreamingApi';
import Holder from "./components/Holder";

function App() {
  const hijoRef = useRef(null);
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
      <Holder></Holder>
      <StreamingApi ref={hijoRef}></StreamingApi>
      <>{currentPage}</>
      
    </div>
  );
}


export default App;
