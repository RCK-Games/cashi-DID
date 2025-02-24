import React, { useContext, useState, useRef } from "react";
import "../styles/Chat.css";
import { ElementContextOpenAi } from "../context/OpenAiContext";
const Holder = () => {
  const { lastMessage, setLastMessage } = useContext(ElementContextOpenAi);
  const updateButton = async () => {
    console.log("update");
    const paragraph = document.getElementById("textHolder");
    if (paragraph) {
      paragraph.textContent = "Hello how are you?";
    }
  };
  const sendPayload = async () => {
    console.log(lastMessage);
    const button = document.getElementById("stream-word-button");
      if (button) {
        button.click();
      }
  };

  return (
    <>
      <button id="upda-button" type="button" onClick={updateButton}>
        Update
      </button>
      <button id="payload-button" type="button" onClick={sendPayload}>
        Payload
      </button>
      <p style={{fontSize: "0px"}} id="textHolder"> Hello world</p>
    </>
  );
};

export default Holder;
