import "../styles/Login.css";
import "../styles/Chat.css";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState, useEffect, useRef, useContext } from "react";
import Holder from "../components/Holder";
import logo from "../img/Brand_Cashi.png";
import icon from "../img/Icon_send.png";
import iconMenu from "../img/Icon_Menu.png";
import url from "../img/Icon_URL_circle.png";

import { Offcanvas } from "react-bootstrap";

import { ElementContextOpenAi } from "../context/OpenAiContext";
import { ElementContextRoute } from "../context/RouteContext";

function Main() {
  const [show, setShow] = useState(false);
  //DEMO
  const [firstMessageSend, setFirstMessageSend] = useState(true);
  const inputRef = useRef(null);

  const { OpenAiInterface, finishLoading, AddLocalMessage, messageList } = useContext(ElementContextOpenAi);
  const {id} = useContext(ElementContextRoute);
  
  const lastMessageRef = useRef(null);


  useEffect(() => {
    console.log("MessageHolder")
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [finishLoading]);

  const handleClose = () => {
    setShow(false);
  };
  const handleShow = () => {
    console.log("show");
    setShow(true);
  };

  function formatBoldText(input) {
    return input.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  }

  function formatTextWithBreaks(text) {
    return text.replace(/(\d+\.\s)/g, "<br>$1").trim();
  }

  const chat = async () => {
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
      const messageHolder = inputRef.current.value
      inputRef.current.value = ""

      
      await AddLocalMessage(messageHolder)
      console.log("waiting")
      await OpenAiInterface(messageHolder)
      console.log("done")
      

    }
    
    console.log("Send Chat");
  };


  if (lastMessageRef.current) {
    lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      
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

        <div className="chatContainerParent">
      <Holder></Holder>
      <div className="chat-container">
        <div className="spacer"></div>

      {messageList.length === 0 ? <></> : (<>
        {messageList.current.map((message, index) => (
          <div
            key={index}
            ref={index === messageList.length - 1 ? lastMessageRef : null}
            className={`message ${
              message.role === "assistant" ? "assistant" : "user"
            }`}
          >
            <p
              style={{ boxSizing: "border-box", margin: "0px", padding: "0px" }}
              dangerouslySetInnerHTML={{
                __html: formatTextWithBreaks(
                  formatBoldText(message.content[0].value)
                ),
              }}
            />
          </div>
        ))}
      </>)}


        {finishLoading ? null : (
          <div className="message assistant" style={{ width: "60px" }}>
            <div className="lds-ellipsis">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        )}
      </div>
    </div>
        <div className="inputsDiv">
          <textarea
            ref={inputRef}
            id="textArea"
            placeholder="Envía un mensaje a Cashimiro"
            autoFocus
            style={{textAlign: "left"}}
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
