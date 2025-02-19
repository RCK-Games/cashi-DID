import { ElementContextRoute } from "./context/RouteContext";
import React, { useContext } from "react";
import Login from "./pages/Login"
import './App.css';
import Main from "./pages/Main";
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
      <Main></Main>
      <>{currentPage}</>
      
    </div>
  );
}


export default App;
