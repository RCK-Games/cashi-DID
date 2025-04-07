import React, { createContext, useRef, useState } from "react";
import { interfaceRag } from "./RagInterface.ts";
import { AhoCorasickInterface, isThisQuestionReal } from "./AhoCorasick.js";
import { badWordsChecker } from "./AhoCorasickBadWords.js";
const ElementContextOpenAi = createContext();

const ElementProviderOpenAi = ({ children }) => {
  const messageList = useRef([]);
  const [finishLoading, setFinishLoading] = useState(true);
  const [agentVideo, setAgentVideo] = useState(null);
  const ActiveThreadChecker = useRef(null);
  const ActiveThreadTalker = useRef(null);
  const open_ia_key = process.env.REACT_APP_OPENAI_API_KEY
  const assistantIdChecker = "asst_mJ0Jg04jzxZoeobPTLFLb15s";
  const assistantIdTalker = "asst_63tzfPzsH6SVUp5wtwoMtItf";

  const OpenAiInterface = async (messageContent) => {
    const cronometro = new Cronometro();
    cronometro.start();
    const AhoCorasickBadWords = badWordsChecker(messageContent)
    if(AhoCorasickBadWords === true) {
      
        console.log(cronometro.stop());
        AddAssistantMessage("Bad Word");
        setFinishLoading(true);
        setAgentVideo("Bad Word");
        return messageList;
      
    }

    
    const AhoCorasickResult = AhoCorasickInterface(messageContent)
    console.log(AhoCorasickResult)
    if(AhoCorasickResult != null) {
      if(AhoCorasickResult.length > 0){
        console.log(cronometro.stop());
        AddAssistantMessage(AhoCorasickResult[0]);
        setFinishLoading(true);
        setAgentVideo(AhoCorasickResult[0]);
        return messageList;
      }
    }
   
    setFinishLoading(false);
    console.log("Initialize Defender", cronometro.markInterval());
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
      console.log(cronometro.stop());
      AddAssistantMessage("Error en Tiempo de Espera");
      setFinishLoading(true);
      return messageList;
    }
    
    if (AiCheckerResponseChecker.is_valid) {

      if(AiCheckerResponseChecker.top_question != null){
        if(AiCheckerResponseChecker.top_question.is_top_question){
          if(isThisQuestionReal(AiCheckerResponseChecker.top_question.value)){
            console.log(cronometro.stop());
            AddAssistantMessage(AiCheckerResponseChecker.top_question.value);
            setFinishLoading(true);
            setAgentVideo(AiCheckerResponseChecker.top_question.value);
            return messageList;
          }

        }
      }

     
      console.log("Inititilize AI Response", cronometro.markInterval());
      sendHeartBeat()
      let _activeThreadTalker = ActiveThreadTalker.current;
      if (_activeThreadTalker === null) {
        _activeThreadTalker = await handleNewThread(false);
      }

	    //messageContent = await interfaceRag(messageContent)

      const AiCheckerResponseTalker = removeSource(
        await handleThreadInterface(messageContent, _activeThreadTalker, false)
      );
      if (AiCheckerResponseTalker === null) {
        console.log(cronometro.stop());
        AddAssistantMessage("Error en Tiempo de Espera");
        setFinishLoading(true);
        return messageList;
      }
      
      triggerApi(AiCheckerResponseTalker);
      if (agentVideo != null) {
        setAgentVideo(null);
      }
      console.log(cronometro.stop());
      setFinishLoading(true);
      return messageList;
    } else {
      //Idk
      console.log(cronometro.stop());
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

  const sendHeartBeat = () => {
    const button = document.getElementById("send-heartbeat-button");
    if (button) {
      button.click();
    }
  };

  const useRagInterface = async (value) => {
    return await interfaceRag(value);
  }

  const processJsonFile = (_value) => {
    if(_value === null) {
      return null
    }
    let string
    if(_value[0] === "`"){
      string = _value.split("```json")
      if(string[1][string[1].length-1] === "`"){
        return JSON.parse(string[1].slice(0, -3))
      }
      return JSON.parse(string[1])
    }else{
      return JSON.parse(_value)
    }
  }
  class Cronometro {
    constructor() {
      this.startTime = 0;
      this.elapsedTime = 0;
      this.running = false;
      this.intervals = [];
    }
  
    start() {
      if (!this.running) {
        this.startTime = performance.now() - this.elapsedTime;
        this.running = true;
      }
    }
  
    stop() {
      if (this.running) {
        this.elapsedTime = performance.now() - this.startTime;
        this.running = false;
      }
      return this.elapsedTime.toFixed(2);
    }
  
    reset() {
      this.startTime = 0;
      this.elapsedTime = 0;
      this.running = false;
      this.intervals = [];
    }
  
    markInterval() {
      const currentTime = this.getTime();
      const lastInterval = this.intervals.length > 0 ? this.intervals[this.intervals.length - 1] : 0;
      let intervalTime = currentTime - lastInterval;
      if(lastInterval === 0){
        intervalTime = 0
      }
      this.intervals.push(currentTime);
      return { totalTime: this.elapsedTime.toFixed(2), intervalTime: intervalTime.toFixed(2) };
    }
  
    getTime() {
      return this.running ? Date.now() - this.startTime : this.elapsedTime;
    }
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
