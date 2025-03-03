import React, { useEffect, useRef, useContext } from "react";
import "../styles/Chat.css";
import { ElementContextOpenAi } from "../context/OpenAiContext";
import Holder from "./Holder";
const Chat = ({ messages }) => {
  const lastMessageRef = useRef(null);

  const { finishLoading } = useContext(ElementContextOpenAi);
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (messages == null || messages === undefined || messages.length === 0) {
    return <></>;
  }

  function formatBoldText(input) {
    return input.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  }

  function formatTextWithBreaks(text) {
    return text.replace(/(\d+\.\s)/g, "<br>$1").trim();
  }

  return (
    <div className="chatContainerParent">
      <Holder></Holder>
      <div className="chat-container">
        <div className="spacer"></div>
        {messages.current.map((message, index) => (
          <div
            key={index}
            ref={index === messages.length - 1 ? lastMessageRef : null}
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
  );
};

export default Chat;
