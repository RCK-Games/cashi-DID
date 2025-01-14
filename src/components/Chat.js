import React from 'react';
import '../styles/Chat.css';

const Chat = ({ messages }) => {

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
