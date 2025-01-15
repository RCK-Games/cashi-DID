import React from 'react';
import '../styles/Chat.css';
import React, { useEffect, useRef } from 'react';
const Chat = ({ messages }) => {

  const lastMessageRef = useRef(null);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  if(messages == null || messages == undefined){
    return(<></>)
  }

  return (
    <div className='chatContainerParent'>
        
        <div className="chat-container">
        <div className='spacer'>

</div>
        {messages.map((message, index) => (
            <div
            key={index}
            ref={index === messages.length - 1 ? lastMessageRef : null}
            className={`message ${message.role === 'assistant' ? 'assistant' : 'user'}`}
            >
            {message.content}
            </div>
        ))}
        </div>
    </div>
  );
};

export default Chat;
