

import React, { createContext, useState } from "react";

const ElementContextOpenAi = createContext();

const ElementProviderOpenAi= ({ children }) => {
  const [messageList, setMessageList] = useState([]);
  const [streamWord, setStreamWord] = useState(null);
  const [finishLoading, setFinishingLoading] = useState(null);
  const [ActiveThreadChecker, setActiveThreadChecker] = useState(null);
  const [ActiveThreadTalker, setActiveThreadTalker] = useState(null);
  const open_ia_key = '';
    const assistantIdChecker = "asst_49xk6o2iqWv6WreQfU0Cf0v3";
    const assistantIdTalker = "asst_63tzfPzsH6SVUp5wtwoMtItf";


const OpenAiInterface = async (messageContent) =>{
	setFinishingLoading(false)
    let _activeThreadChecker = ActiveThreadChecker
    if(_activeThreadChecker === null){
        _activeThreadChecker = await handleNewThread(true)
    }
    const AiCheckerResponseChecker = await handleThreadInterface(messageContent, _activeThreadChecker, true)

    if(AiCheckerResponseChecker === "yes"){
        let _activeThreadTalker = ActiveThreadTalker
        if(_activeThreadTalker === null){
            _activeThreadTalker = await handleNewThread(false)
        }
        const AiCheckerResponseTalker = await handleThreadInterface(messageContent, _activeThreadTalker, false)
		setStreamWord(AiCheckerResponseChecker)
		setFinishingLoading(true)
        return AiCheckerResponseTalker
    }else{
        //Idk
		setFinishingLoading(true)
		setStreamWord(null)
        return null
    }

}

const handleThreadInterface = async (messageContent, openThread, isChecker) =>{
    await promiseWithTimeout(
        handleMessageToThread(messageContent, openThread),
        10000,
        'Timeout in handleMessageToThread'
    )
    let data = await promiseWithTimeout(handleRun(openThread, isChecker), 10000, 'Timeout en handleRun')
    await promiseWithTimeout(
        checkRunStatus(data.id, openThread),
        10000,
        'Timeout in checkRunStatus'
    )
    let response = await promiseWithTimeout(
        fetchMessages(openThread, isChecker),
        10000,
        'Timeout in fetchMessages'
    )
    return response.data[0].content[0].text.value.toLowerCase()
}

function promiseWithTimeout(promise, timeout = 5000, errorMessage = 'Operation took to long') {
	return new Promise((resolve, reject) => {
		const timeoutId = setTimeout(() => reject(new Error(errorMessage)), timeout)

		promise
			.then((result) => {
				clearTimeout(timeoutId)
				resolve(result)
			})
			.catch((error) => {
				clearTimeout(timeoutId)
				reject(error)
			})
	})
}

const  handleNewThread = async (isChecker) =>{

    try {
		const response = await fetch('https://api.openai.com/v1/threads', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${open_ia_key}`,
				'Content-Type': 'application/json',
				'OpenAI-Beta': 'assistants=v2'
			},
			body: JSON.stringify({})
		})
		const data = await response.json()
        if(isChecker){
            setActiveThreadChecker(data.id)
        }else{
            setActiveThreadTalker(data.id)
        }
        return data.id
	} catch (error) {
		console.error('Error in creating a new Thread:', error)
	}

}

const handleMessageToThread = async(newMessage, activeThread) => {
try {
		const response = await fetch(`https://api.openai.com/v1/threads/${activeThread}/messages`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${open_ia_key}`,
				'Content-Type': 'application/json',
				'OpenAI-Beta': 'assistants=v2'
			},
			body: JSON.stringify({
				role: 'user',
				content: `${newMessage}`
			})
		})
		return response
	} catch (error) {
		console.error('Failed to send message to thread:', error)
	}

}

const handleRun =async (activeThread, isChecker) => {
    let assistantId
    if(isChecker){
        assistantId = assistantIdChecker
    }else{
        assistantId = assistantIdTalker
    }
    try {
		const response = await fetch(`https://api.openai.com/v1/threads/${activeThread}/runs`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${open_ia_key}`,
				'Content-Type': 'application/json',
				'OpenAI-Beta': 'assistants=v2'
			},
			body: JSON.stringify({
				assistant_id: `${assistantId}`,
				model: 'gpt-4o-mini'
			})
		})
		const data = await response.json()
		return data
	} catch (error) {
		console.error('Failed to handle run:', error)
	}
}

const checkRunStatus = async (runId, activeThread) => {

    try {
		// eslint-disable-next-line no-constant-condition
		while (true) {
			const response = await fetch(
				`https://api.openai.com/v1/threads/${activeThread}/runs/${runId}`,
				{
					method: 'GET',
					headers: {
						Authorization: `Bearer ${open_ia_key}`,
						'Content-Type': 'application/json',
						'OpenAI-Beta': 'assistants=v2'
					}
				}
			)

			const data = await response.json()

			if (data.status === 'completed') {
				return data
			}

			if (data.status === undefined) {
				return
			}

			await new Promise((resolve) => setTimeout(resolve, 3000))
		}
	} catch (error) {
		console.error('Failed to check run status:', error)
	}
}

const fetchMessages = async (activeThread, isChecker) => {
    try {
		const response = await fetch(
			`https://api.openai.com/v1/threads/${activeThread}/messages?limit=100`,
			{
				method: 'GET',
				headers: {
					Authorization: `Bearer ${open_ia_key}`,
					'Content-Type': 'application/json',
					'OpenAI-Beta': 'assistants=v2'
				}
			}
		)
		const data = await response.json()
        if(isChecker === false){
            setMessageList(data)
        }
		return data
	} catch (error) {
		console.error('Failed to fetch messages:', error)
	}
}

return (
    <ElementContextOpenAi.Provider value={{ messageList, OpenAiInterface, streamWord, finishLoading }}>
      {children}
    </ElementContextOpenAi.Provider>
  );
};

export { ElementContextOpenAi, ElementProviderOpenAi };


