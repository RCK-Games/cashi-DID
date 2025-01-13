
import React, {useState, useEffect, useRef } from "react";
import * as sdk from "@d-id/client-sdk";
import logo from "./img/Brand_Cashi.png";
import icon from "./img/Icon_send.png";
import iconMenu from "./img/Icon_Menu.png";
const DIdAgentDemo = () => {
    let agentId = "agt_InewfASc"
    let auth = { type: 'key', clientKey: "Z29vZ2xlLW9hdXRoMnwxMDAzMjYwNTk2MTIwNDYwMDg0NjI6a0VNY1h0LXVwMEpkTUN6STc4dldz" };
    const [agentManager2, setAgentManager] = useState(null);
    let videoElement
    let textArea
    //let langSelect
    //let speechButton
    let answers
    //let connectionLabel
    let chatButton
    let speakButton
    let reconnectButton
    const inputRef = useRef(null);
    let srcObject
    let agentManager

    if(agentManager2){
      agentManager = agentManager2
    }

    let streamOptions = { compatibilityMode: "auto", streamWarmup: true }
    
    useEffect( () => {
       videoElement = document.querySelector("#videoElement")
       textArea = document.querySelector("#textArea")
       //langSelect = document.querySelector("#langSelect")
       //speechButton = document.querySelector("#speechButton");
       answers = document.querySelector("#answers")
       //connectionLabel = document.querySelector("#connectionLabel")
       chatButton = document.querySelector('#chatButton')
       speakButton = document.querySelector('#speakButton')
       reconnectButton = document.querySelector('#reconnectButton')
        init()
    }, [])

    const handleSubmit = () => {
      if (inputRef.current) {
        console.log(inputRef.current.value);
      }
    };

    const init = async ()=>{
      let hold = await sdk.createAgentManager(agentId, { auth, callbacks, streamOptions });
      agentManager = hold
      setAgentManager(hold);
        console.log("sdk.createAgentManager()", hold)
        //document.querySelector("#previewName").innerHTML = hold.agent.preview_name
        
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
    
            /*if (state == "connecting") {
                //connectionLabel.innerHTML = "Connecting.."
                document.querySelector("#container").style.display = "flex"
                document.querySelector("#hidden").style.display = "none"
            }
    
            else if (state == "connected") {
                // Setting the 'Enter' Key to Send a message
                textArea.addEventListener('keypress', (event) => { if (event.key === "Enter") { event.preventDefault(); chat() } })
                chatButton.removeAttribute("disabled")
                speakButton.removeAttribute("disabled")
                //langSelect.removeAttribute("disabled")
                //speechButton.removeAttribute("disabled")
                //connectionLabel.innerHTML = "Online"
            }
    
            else if (state == "disconnected" || state == "closed") {
                textArea.removeEventListener('keypress', (event) => { if (event.key === "Enter") { event.preventDefault(); chat() } })
                document.querySelector("#hidden_h2").innerHTML = `${agentManager.agent.preview_name} Disconnected`
                document.querySelector("#hidden").style.display = "block"
                document.querySelector("#container").style.display = "none"
                chatButton.setAttribute("disabled", true)
                speakButton.setAttribute("disabled", true)
                //langSelect.setAttribute("disabled", true)
                //speechButton.setAttribute("disabled", true)
                //connectionLabel.innerHTML = ""
            }*/
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
              //connectionLabel.innerHTML = "Online"
          }
      },
    
        // New messages callback method
        onNewMessage(messages, type) {
            console.log("onNewMessage():", messages, type)
            // We want to show only the last message from the entire 'messages' array
            let lastIndex = messages.length - 1
            let msg = messages[lastIndex]
            console.log(answers)
            // Show Rating buttons only for the Agent's (assistant) full answers
            if (msg.role == "assistant" && messages.length != 1) {
                if (type == "answer") {
                    answers.innerHTML += `${timeDisplay()} - [${msg.role}] : ${msg.content}  <button id='${msg.id}_plus' title='agentManager.rate() -> Rate this answer (+)'>+</button> <button id='${msg.id}_minus' title='agentManager.rate() -> Rate this answer (-)'>-</button> <br>`
    
                    document.getElementById(`${msg.id}_plus`).addEventListener('click', () => rate(msg.id, 1))
                    document.getElementById(`${msg.id}_minus`).addEventListener('click', () => rate(msg.id, -1))
                }
    
            } else {
              
                //answers.innerHTML += `${timeDisplay()} - [${msg.role}] : ${msg.content}  <br>`
            }
    
            // Auto-scroll to the last message 
            //answers.scrollTop = answers.scrollHeight
        },
    
        // Error handling
        onError(error, errorData) {
            //connectionLabel.innerHTML = `<span style="color:red">Something went wrong :(</span>`
            console.log("Error:", error, "Error Data", errorData)
        }
    
    }

    const speak = () => {
        let val = inputRef.current.value
        // Speak supports a minimum of 3 characters
        if (val !== "" && val.length > 2) {
            let speak = agentManager.speak(
                {
                    type: "text",
                    input: val
                }
            )
            console.log(`agentManager.speak("${val}")`)
            //connectionLabel.innerHTML = "Streaming.."
        }
    }

    const chat  = () => {
      console.log(inputRef.current.value)
        let val = inputRef.current.value
        if (val !== "") {
            let chat = agentManager.chat(val)
            console.log("agentManager.chat()")
            //connectionLabel.innerHTML = "Thinking.."
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

  return (
    <div id="container">
      <div id="header" className="header">
        <img src={iconMenu} className="header-item left"/>
        <span id="previewName" className="header-item center">Asegúrate de activar tu audio</span>
        <img src={logo} className="header-item right"/>
      </div>
      <div className="header-separator"></div>
      <div>
        <video id="videoElement" autoPlay loop></video>
      </div>

      {/*<div>
        <button
          id="chatButton"
          title="agentManager.chat() -> Communicate with your Agent (D-ID LLM)"
          onClick={chat}
        >
          Chat
        </button>
        <button
          id="speakButton"
          title="agentManager.speak() -> Streaming API (Bring your own LLM)"
          onClick={speak}
        >
          Speak
        </button>
      </div>*/}
      
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
      {/*<div style={{ display: "flex" }}>
        <select
          id="langSelect"
          title="Speech to Text - Language Selection"
          defaultValue="en_US"
        >
          <option value="en_US" disabled>
            TTS Language
          </option>
          <option value="en_US">English</option>
          <option value="es_ES">Spanish</option>
          <option value="fr_FR">French</option>
          <option value="it_IT">Italian</option>
          <option value="de_DE">German</option>
          <option value="he_IL">Hebrew</option>
          <option value="ru_RU">Russian</option>
        </select>
        <button  id="speechButton" title="Speech to Text - Web Speech API (MDN)">
          &#127908;
        </button>
      </div>*/}

      {/*<div id="answers"></div>

      <div id="hidden" style={{ display: "none" }}>
        <h2 id="hidden_h2"></h2>
        <button
          id="reconnectButton"
          title="agentManager.reconnect() -> Reconnects the previous WebRTC session"
          onClick={reconnect}
        >
          Reconnect
        </button>
      </div>*/}
      <span className="lowerText">Cashimiro AI puede cometer errores. Verifica la información importante.</span>
    </div>
  );
};

export default DIdAgentDemo;
