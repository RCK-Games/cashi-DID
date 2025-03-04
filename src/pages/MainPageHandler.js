import '../styles/Login.css';
import React from "react";
import { ElementProviderOpenAi } from '../context/OpenAiContext';
import Main from './Main';
import AgentVideo from '../components/AgentVideo';

function MainPageHandler (){


    return(
        <>
        
        <ElementProviderOpenAi>
            <AgentVideo></AgentVideo>
            <Main></Main>
        </ElementProviderOpenAi>
        </>
    );
}
export default MainPageHandler;
