import "../styles/Login.css";

import React, { useState, useEffect, useRef, useContext } from "react";

import logo from "../img/Brand_Cashi.png";
import icon from "../img/Icon_send.png";
import iconMenu from "../img/Icon_Menu.png";
import url from "../img/Icon_URL_circle.png";

import { Offcanvas } from "react-bootstrap";
import Chat from "../components/Chat";

import "bootstrap/dist/css/bootstrap.min.css";
import StreamingApi from "../components/Streaming/StreamingApi";
import { ElementContextOpenAi } from "../context/OpenAiContext";
import { ElementContextRoute } from "../context/RouteContext";
function Main() {
  const [show, setShow] = useState(false);
  //DEMO
  const [firstMessageSend, setFirstMessageSend] = useState(true);
  const inputRef = useRef(null);

  const { messageList, OpenAiInterface, finishLoading, AddLocalMessage } = useContext(ElementContextOpenAi);
  const {id} = useContext(ElementContextRoute);
  
  const handleClose = () => {
    setShow(false);
  };
  const handleShow = () => {
    console.log("show");
    setShow(true);
  };
  const chat = () => {
    console.log(finishLoading)
    if(!finishLoading){
      return
    }

    if(!firstMessageSend){
      const response = fetch( "https://cashi.rckgames.com/back/api/v1/conversations/started",{
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                      id: id
                  })
              })
              .then(response => {
                  if(!response.ok){
                      throw new Error("Error en el servidor");
                  }
              })
      setFirstMessageSend(true)
    }
    if (inputRef.current.value !== "") {
      AddLocalMessage(inputRef.current.value)
      OpenAiInterface(inputRef.current.value)
      inputRef.current.value = ""
    }
    
    console.log("Send Chat");
  };

  return (
    <>
      <StreamingApi className="AgentContainer"></StreamingApi>
      <div className="ChatContainer" id="container">
        <div id="header" className="header">
          <img
            src={iconMenu}
            className="header-item left clickable-image"
            alt="Menu"
            onClick={handleShow}
          />
          <span id="previewName" className="header-item center">
            Asegúrate de activar tu audio
          </span>
          <img src={logo} className="header-item right" />
        </div>
        <div className="parent-container">
          <div className="header-separator"></div>
        </div>

        <Chat messages={messageList}></Chat>
        <div className="inputsDiv">
          <textarea
            ref={inputRef}
            id="textArea"
            placeholder="Envía un mensaje a Cashimiro"
            autoFocus
          ></textarea>
          <button
            className="sendButton"
            id="chatButton"
            title="agentManager.chat() -> Communicate with your Agent (D-ID LLM)"
            onClick={chat}
          >
            <img src={icon} className="buttonSendIcon" />
          </button>
        </div>
        <h4 className="lowerText">
          Cashimiro AI puede cometer errores. Verifica la información
          importante.
        </h4>
        <Offcanvas show={show} onHide={handleClose}>
          <Offcanvas.Header closeButton></Offcanvas.Header>
          <Offcanvas.Body>
            <ul className="ul">
              <li>
                <img src={url} className="img-URL"></img>Url
              </li>
            </ul>
          </Offcanvas.Body>
        </Offcanvas>
      </div>
    </>
  );
}
export default Main;
