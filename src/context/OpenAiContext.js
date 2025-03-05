import OpenAI from "openai"
import { DataAPIClient } from "@datastax/astra-db-ts"

import React, { createContext, useRef, useState } from "react";
import { interfaceRag } from "./RagInterface.ts";

const ElementContextOpenAi = createContext();

const ElementProviderOpenAi = ({ children }) => {
  const messageList = useRef([]);
  const [finishLoading, setFinishLoading] = useState(true);
  const [agentVideo, setAgentVideo] = useState(null);
  const ActiveThreadChecker = useRef(null);
  const initTimer = useRef(null);
  const endTimer = useRef(null);
  const ActiveThreadTalker = useRef(null);
  const timer = useRef(null);
  const open_ia_key = process.env.REACT_APP_OPENAI_API_KEY
  const assistantIdChecker = "asst_rIxnJR3uiCjMMIv599ibKFeW";
  const assistantIdTalker = "asst_63tzfPzsH6SVUp5wtwoMtItf";

	console.log(process.env.REACT_APP_ASTRA_DB_API_ENPOINT, process.env.REACT_APP_ASTRA_DB_NAMESPACE)

  const client = new DataAPIClient(process.env.REACT_APP_ASTRA_DB_APPLICATION_TOKEN)
  const db = client.db(process.env.REACT_APP_ASTRA_DB_API_ENPOINT, {namespace: process.env.REACT_APP_ASTRA_DB_NAMESPACE})


  const openai = new OpenAI({ apiKey: open_ia_key, dangerouslyAllowBrowser: true });
  const OpenAiInterface = async (messageContent) => {
    timer.current = createTimer();
    
    const keywords = [
      "Yes.",
      "Yes",
      "yes",
      "yes.",
      "yes,",
      "Yes,",
      "Si.",
      "Si",
      "si",
      "si.",
      "si,",
      "Si,",
      "Sí.",
      "Sí",
      "sí",
      "sí.",
      "sí,",
      "Sí,",
    ];
    setFinishLoading(false);
    console.log("Initialize Defender");
    let _activeThreadChecker = ActiveThreadChecker.current;
    if (_activeThreadChecker === null) {
      _activeThreadChecker = await handleNewThread(true);
    }
    const AiCheckerResponseChecker = processJsonFile(await handleThreadInterface(
      messageContent,
      _activeThreadChecker,
      true
    ));

    if (AiCheckerResponseChecker === null) {
      timer.current.stop(); 
      AddAssistantMessage("Error en Tiempo de Espera");
      setFinishLoading(true);
      return messageList;
    }
    
    if (AiCheckerResponseChecker.is_valid) {

      if(AiCheckerResponseChecker.top_question != null){
        if(AiCheckerResponseChecker.top_question.is_top_question){
          timer.current.stop(); 
          AddAssistantMessage(AiCheckerResponseChecker.top_question.value);
          setFinishLoading(true);
          setAgentVideo(AiCheckerResponseChecker.top_question.value);
          return messageList;
        }
      }

      timer.current.start();
      console.log("Inititilize AI Response");
      let _activeThreadTalker = ActiveThreadTalker.current;
      if (_activeThreadTalker === null) {
        _activeThreadTalker = await handleNewThread(false);
      }

	    //messageContent = await interfaceRag(messageContent)

      const AiCheckerResponseTalker = removeSource(
        await handleThreadInterface(messageContent, _activeThreadTalker, false)
      );
      if (AiCheckerResponseTalker === null) {
        timer.current.stop(); 
        AddAssistantMessage("Error en Tiempo de Espera");
        setFinishLoading(true);
        return messageList;
      }
      //AddAssistantMessage(AiCheckerResponseTalker)
      triggerApi(AiCheckerResponseTalker);
      if (agentVideo != null) {
        setAgentVideo(null);
      }
      timer.current.stop(); 
      setFinishLoading(true);
      return messageList;
    } else {
      //Idk
      timer.current.stop(); 
      AddAssistantMessage("Pregunta otra cosa");
      setFinishLoading(true);
      setAgentVideo("");
      return messageList;
    }
  };

  const triggerApi = (_value) => {
    const paragraph = document.getElementById("textHolder");
    if (paragraph) {
      paragraph.textContent = removeAsterisks(_value);
    }

    const button = document.getElementById("stream-word-button");
    if (button) {
      button.click();
    }
  };

  const useRagInterface = async (value) => {
    return await interfaceRag(value);
  }

  const triggerRAG = async (_value) => {
	try{
        let docContext = ""

        const embedding = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: _value,
            encoding_format: "float"
        })
		console.log("embedding")
    console.log(embedding.data[0].embedding)
    console.log(embedding.data)
        try{
            const collection = await db.collection(process.env.REACT_APP_ASTRA_DB_COLLECTION)
            const cursor = collection.find(null, {
                sort: {
                    $vector: embedding.data[0].embedding,
                },
                limit: 10
            })
            console.log(cursor)
            console.log(collection)
            const documents = await cursor.toArray()

            const docsMap = documents?.map(doc => doc.text)

            docContext = JSON.stringify(docsMap)
			console.log(docContext)
        }catch(err){
            console.log("Error querying db...")
        }
		console.log("db")
        const template = {
            role: "system",
            content: `You are an AI assistant who knows everything about Cashi.
            Use the below context to augment what you know about Cashi.
            The context will provide you with the most recent page data from the official database,
            If the context doesn't include the information you need answer based on your 
            existing knowledge and don't mention the source of your information or
            what the context does or doesn't include.
            Format responses using markdown where applicable and don't return 
            images.
        ----------------
        START CONTEXT
        ${docContext}
        END CONTEXT
        ----------------
        QUESTION ${_value}
        -----------------
        `
        }
		console.log(template)
		return template
		

    }catch (err){
        throw err
    }
  }

  const processJsonFile = (_value) => {
    let string
    if(_value[0] === "`"){
      console.log(_value)
      string = _value.split("```json")
      console.log(string)
      if(string[1][string[1].length-1] === "`"){
        return JSON.parse(string[1].slice(0, -3))
      }
      return JSON.parse(string[1])
    }else{
      return JSON.parse(_value)
    }
  }

  const createTimer = () => {
    initTimer.current = null
    endTimer.current = null
  
    return {
      start: function () {
        initTimer.current = performance.now(); // Usamos performance.now() para mayor precisión
        endTimer.current = null;
        console.log("Timer iniciado...");
      },
      stop: function () {
        if (initTimer.current === null) {
          console.log("El timer no ha sido iniciado.");
          return null;
        }
        endTimer.current = performance.now();
        const elapsedTime = endTimer.current - initTimer.current;
        console.log(`Timer detenido. Tiempo transcurrido: ${elapsedTime.toFixed(2)} ms`);
        return elapsedTime; // Retorna el tiempo en milisegundos
      },
    };
  }

  const AddAssistantMessage = (_value) => {
    const newMessage = {
      content: [
        {
          type: "text",
          annotations: [],
          value: _value,
        },
      ],
      role: "assistant",
    };
    messageList.current.push(newMessage);
  };

  const AddLocalMessage = (_value) => {
    const newMessage = {
      content: [
        {
          type: "text",
          annotations: [],
          value: _value,
        },
      ],
      role: "user",
    };
    messageList.current.push(newMessage);
    return messageList;
  };

  const handleThreadInterface = async (
    messageContent,
    openThread,
    isChecker
  ) => {
    try {
      console.log("Thread: ", messageContent, openThread, isChecker);
      await promiseWithTimeout(
        handleMessageToThread(messageContent, openThread),
        10000,
        "Timeout in handleMessageToThread"
      );

      let data = await promiseWithTimeout(
        handleRun(openThread, isChecker),
        30000,
        "Timeout en handleRun"
      );
      await promiseWithTimeout(
        checkRunStatus(data.id, openThread),
        30000,
        "Timeout in checkRunStatus"
      );

      let response = await promiseWithTimeout(
        fetchMessages(openThread, isChecker),
        20000,
        "Timeout in fetchMessages"
      );

      if (isChecker === false) {
        AddAssistantMessage(
          removeSource(response.data[0].content[0].text.value)
        );
      }
      return response.data[0].content[0].text.value.toLowerCase();
    } catch (e) {
      return null;
    }
  };

  function removeAsterisks(text) {
    return text.replace(/\*\*/g, "");
  }

  function removeSource(text) {
    if (text) {
      return text.replace(/【\d+:\d+\†source】/g, "");
    } else {
      return null;
    }
  }

  function promiseWithTimeout(
    promise,
    timeout = 5000,
    errorMessage = "Operation took to long"
  ) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(
        () => reject(new Error(errorMessage)),
        timeout
      );

      promise
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  const handleNewThread = async (isChecker) => {
    try {
      const response = await fetch("https://api.openai.com/v1/threads", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${open_ia_key}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2",
        },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (isChecker) {
        ActiveThreadChecker.current = data.id;
      } else {
        ActiveThreadTalker.current = data.id;
      }
      return data.id;
    } catch (error) {
      console.error("Error in creating a new Thread:", error);
    }
  };

  const handleMessageToThread = async (newMessage, activeThread) => {
    try {
      const response = await fetch(
        `https://api.openai.com/v1/threads/${activeThread}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${open_ia_key}`,
            "Content-Type": "application/json",
            "OpenAI-Beta": "assistants=v2",
          },
          body: JSON.stringify({
            role: "user",
            content: `${newMessage}`,
          }),
        }
      );
      return response;
    } catch (error) {
      console.error("Failed to send message to thread:", error);
    }
  };

  const handleRun = async (activeThread, isChecker) => {
    let assistantId;
    if (isChecker) {
      assistantId = assistantIdChecker;
    } else {
      assistantId = assistantIdTalker;
    }
    try {
      const response = await fetch(
        `https://api.openai.com/v1/threads/${activeThread}/runs`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${open_ia_key}`,
            "Content-Type": "application/json",
            "OpenAI-Beta": "assistants=v2",
          },
          body: JSON.stringify({
            assistant_id: `${assistantId}`,
            model: "gpt-4o-mini",
          }),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to handle run:", error);
    }
  };

  const checkRunStatus = async (runId, activeThread) => {
    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const response = await fetch(
          `https://api.openai.com/v1/threads/${activeThread}/runs/${runId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${open_ia_key}`,
              "Content-Type": "application/json",
              "OpenAI-Beta": "assistants=v2",
            },
          }
        );

        const data = await response.json();
        console.log("Esperando a OpenAi status: " + data.status)
        if (data.status === "completed") {
          return data;
        }

        if (data.status === undefined) {
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.error("Failed to check run status:", error);
    }
  };

  const fetchMessages = async (activeThread) => {
    try {
      const response = await fetch(
        `https://api.openai.com/v1/threads/${activeThread}/messages?limit=100`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${open_ia_key}`,
            "Content-Type": "application/json",
            "OpenAI-Beta": "assistants=v2",
          },
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  return (
    <ElementContextOpenAi.Provider
      value={{
        messageList,
        OpenAiInterface,
        finishLoading,
        AddLocalMessage,
        agentVideo,
      }}
    >
      {children}
    </ElementContextOpenAi.Provider>
  );
};

export { ElementContextOpenAi, ElementProviderOpenAi };
