
import React, {useState, useEffect, useRef, useContext } from "react";
import * as sdk from "@d-id/client-sdk";
import logo from "./img/Brand_Cashi.png";
import icon from "./img/Icon_send.png";
import iconMenu from "./img/Icon_Menu.png";
import scrollButton from "./img/Circle.png";
import { Offcanvas, Button } from "react-bootstrap";
import { ElementContextRoute } from "./context/RouteContext";
import "bootstrap/dist/css/bootstrap.min.css";
import url from "./img/Icon_URL_circle.png"
import Chat from "./components/Chat";
function DIdAgentDemo () {
  const {id} = useContext(ElementContextRoute);
    let agentId = "agt_vx0f9ZvV"
    let auth = { type: 'key', clientKey: "Z29vZ2xlLW9hdXRoMnwxMDIxMjk5NDY2Njc4Nzc4MDE4MzA6NUUtYkRRTUdrWFh2dVlUTjRuYkRS" };
    const [agentManager2, setAgentManager] = useState(null);
    const [messageList, setMessageList] = useState(null);
    const [firstMessageSend, setFirstMessageSend] = useState(null);
    let videoElement
    let answers
    const inputRef = useRef(null);
    let srcObject
    let agentManager

    if(agentManager2){
      agentManager = agentManager2
    }
    let streamOptions = { compatibilityMode: "auto", streamWarmup: true }
    
    useEffect( () => {
       videoElement = document.querySelector("#videoElement")
       answers = document.querySelector("#answers")
        init()
    }, [])

    const init = async ()=>{
      let hold = await sdk.createAgentManager(agentId, { auth, callbacks, streamOptions });
      agentManager = hold
      setAgentManager(hold);
        console.log("sdk.createAgentManager()", hold)
        document.querySelector("#videoElement").style.backgroundImage = `url(${hold.agent.presenter.source_url})`
        hold.connect()
        console.log("agentManager.connect()")
    }
    const callbacks = {

        // Link the HTML Video element with the WebRTC Stream Object (Video & Audio tracks)
        onSrcObjectReady(value) {
            console.log("onSrcObjectReady():", value)
            videoElement.srcObject = value
            srcObject = value
            return srcObject
        },
    
        // Connection States callback method
        onConnectionStateChange(state) {
          console.log("onConnectionStateChange(): ", state)
        },
    
        // Switching between the idle and streamed videos
        onVideoStateChange(state) {
          console.log("onVideoStateChange(): ", state)
          console.log(agentManager)
          if (state == "STOP") {
              videoElement.muted = true
              videoElement.srcObject = undefined
              videoElement.src = agentManager.agent.presenter.idle_video
          }
          else {
              videoElement.muted = false
              videoElement.src = ""
              videoElement.srcObject = srcObject
          }
      },
    
        // New messages callback method
        onNewMessage(messages, type) {
            console.log("onNewMessage():", messages, type)
            setMessageList(messages)
            console.log(answers)
        },
    
        // Error handling
        onError(error, errorData) {
            console.log("Error:", error, "Error Data", errorData)
        }
    
    }

    const speak = () => {
        let val = inputRef.current.value

        if (val !== "" && val.length > 2) {
            let speak = agentManager.speak(
                {
                    type: "text",
                    input: val
                }
            )
            console.log(`agentManager.speak("${val}")`)

        }
    }

    const chat  = () => {
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
      console.log(inputRef.current.value)
        let val = inputRef.current.value
        if (val !== "") {
            let chat = agentManager.chat(val)
            console.log("agentManager.chat()")
            inputRef.current.value = ""
        }
    }
    const rate = (messageID, score) =>{
        let rate = agentManager.rate(messageID, score)
        console.log(`Message ID: ${messageID} Rated:${score}\n`, "Result", rate)
    }

    const reconnect = ()=>{
        console.log("clicked")
        let reconnect = agentManager.reconnect()
        console.log("agentManager.reconnect()", reconnect)
    }

    const disconnect = ()=>{
        let disconnect = agentManager.disconnect()
        console.log("agentManager.disconnect()", disconnect)
    }

    const timeDisplay = () =>{
        const currentTime = new Date();
        const hours = currentTime.getHours().toString().padStart(2, '0');
        const minutes = currentTime.getMinutes().toString().padStart(2, '0');
        const seconds = currentTime.getSeconds().toString().padStart(2, '0');
        const formattedTime = `${hours}:${minutes}:${seconds}`;
        return formattedTime;
    }

    const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);


  return (
    <div id="container">
      <div id="header" className="header">
        <img src={iconMenu} className="header-item left clickable-image"
         alt="Menu"
         onClick={handleShow}/>
        <span id="previewName" className="header-item center">Asegúrate de activar tu audio</span>
        <img src={logo} className="header-item right"/>
      </div>
      <div className="header-separator"></div>
      <div className="videoContainer">
        <video id="videoElement" autoPlay loop></video>
      </div>
      <Chat messages={messageList}></Chat>
      <div className="inputsDiv">
        <textarea
          ref={inputRef}
          id="textArea"
          placeholder="Envía un mensaje a Cashimiro"
          autoFocus
        >
        </textarea>
        <button className="sendButton"
        id="chatButton"
        title="agentManager.chat() -> Communicate with your Agent (D-ID LLM)"
        onClick={chat}><img src={icon} className="buttonSendIcon"/></button>
      </div>
      <span className="lowerText">Cashimiro AI puede cometer errores. Verifica la información importante.</span>
      <Offcanvas show={show} onHide={handleClose}>
        <Offcanvas.Header closeButton>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <ul>
            <li><img src={url} className= "img-URL"></img>Url</li>
          </ul>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
    
  );
};

export default DIdAgentDemo;
