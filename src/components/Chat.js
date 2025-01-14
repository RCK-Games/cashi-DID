import React from 'react';
import '../styles/Chat.css';

const Chat = ({ messages }) => {

    const testMessages = [
        { content: "Hola, ¿cómo puedo ayudarte?", role: "assistant" },
        { content: "Quiero información sobre React.", role: "user" },
        { content: "React es una biblioteca de JavaScript para construir interfaces de usuario.", role: "assistant" },
        { content: "¿Es fácil de usar?", role: "user" },
        { content: "Sí, es fácil de aprender y tiene una gran comunidad de soporte.", role: "assistant" },
        { content: "Perfecto, gracias por la información.", role: "user" },
        { content: "¡De nada! ¿Hay algo más en lo que te pueda ayudar?", role: "assistant" },
        { content: "Hola, ¿cómo puedo ayudarte?", role: "assistant" },
        { content: "Quiero información sobre React.", role: "user" },
        { content: "React es una biblioteca de JavaScript para construir interfaces de usuario.", role: "assistant" },
        { content: "¿Es fácil de usar?", role: "user" },
        { content: "Sí, es fácil de aprender y tiene una gran comunidad de soporte.", role: "assistant" },
        { content: "Perfecto, gracias por la información.", role: "user" },
        { content: "¡De nada! ¿Hay algo más en lo que te pueda ayudar?", role: "assistant" }
      ];
    messages = testMessages

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
