import '../styles/Login.css';
import React from "react";
import { ElementProviderOpenAi } from '../context/OpenAiContext';
import Main from './Main';

function MainPageHandler (){


    return(
        <>
        <ElementProviderOpenAi>
            <Main></Main>
        </ElementProviderOpenAi>
        </>
    );
}
export default MainPageHandler;
