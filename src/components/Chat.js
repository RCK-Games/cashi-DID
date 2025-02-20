import React, { useEffect, useRef, useContext } from "react";
import "../styles/Chat.css";
import { ElementContextOpenAi } from "../context/OpenAiContext";
const Chat = ({ messages }) => {
  const lastMessageRef = useRef(null);
  
  const { finishLoading } = useContext(ElementContextOpenAi);
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (messages == null || messages === undefined) {
    return <>
    </>;
  }

  function formatBoldText(input) {
    return input.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
}

  console.log(messages);
  return (
    <div className="chatContainerParent">
      <div className="chat-container">
        <div className="spacer"></div>
        {messages.map((message, index) => (
          <div
            key={index}
            ref={index === messages.length - 1 ? lastMessageRef : null}
            className={`message ${
              message.role === "assistant" ? "assistant" : "user"
            }`}
          >
            <p> { formatBoldText(message.content[0].value)}</p>
          </div>
          
        ))}
        {finishLoading ? null : <div
        className="message assistant"
        style={{width: "60px"}}
        >
          <div className="lds-ellipsis"><div></div><div></div><div></div></div>
        </div>}
        
      </div>
    </div>
  );
};

export default Chat;
