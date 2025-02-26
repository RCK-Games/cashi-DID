import { ElementContextRoute } from "./context/RouteContext";
import React, { useContext } from "react";
import Login from "./pages/Login";
import "./App.css";
import StreamingApi from "./components/Streaming/StreamingApi";
import MainPageHandler from "./pages/MainPageHandler";
function App() {
  const { route } = useContext(ElementContextRoute);

  let currentPage;
  // eslint-disable-next-line default-case
  switch (route) {
    case "":
      currentPage = <Login></Login>;
      break;
    case "Main":
      currentPage = <StreamingApi className="AgentContainer"></StreamingApi>;
      break;
    case "Login":
      currentPage = <Login></Login>;
      break;
  }

  return (
    <div className="App">
      <MainPageHandler></MainPageHandler>
      <>{currentPage}</>
    </div>
  );
}

export default App;
