import '../styles/Login.css';
import {useContext, useRef, useState} from "react";
import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { ElementContextRoute } from "../context/RouteContext";

function Login (){
    const inputRefName = useRef(null);
    const inputRefEmail = useRef(null);
    const inputRefEdad = useRef(null);
    const {changeRoute, setId} = useContext(ElementContextRoute);

    
    const onClickLogIn= async ()=>{
        
        if(inputRefName.current.value.trim() !== "" && inputRefEmail.current.value.trim() !== "" && inputRefEdad.current.value.trim() !== ""){
            const emailValue = inputRefEmail.current.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          
            if (!emailRegex.test(emailValue)) {
              alert("Por favor, ingresa un email válido");
              return;
            }
            const response = fetch( "https://cashi.rckgames.com/back/api/v1/signin",{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: inputRefName.current.value,
                        email: inputRefEmail.current.value,
                        age: inputRefEdad.current.value
                    })
                })
                .then(response => {
                    if(!response.ok){
                        throw new Error("Error en el servidor");
                    }
                    return response.json();
                }).then(data =>{
                    changeRoute("Main")
                    setId(data.id);
                    console.log(data);
                })
        }


    }
    const handleAgeInput = (e) => {
        const value = parseInt(e.target.value, 10);
        if(value > 99) e.target.value = 99;
        if(value < 0 || isNaN(value)) e.target.value = "";
    };

    return(
        <div className="background">
            <div>
            <h1 style={{color: "#5C1F99", fontSize: "53px", marginTop: "20vh", marginBottom: "0", textAlign: "center"}}>Cashimiro AI</h1>
                <h2 style={{marginTop: "0", color: "#5C1F99", textAlign: "center", fontSize: "21px"}}>Bienvenidos a Cashimiro,
                    <span style={{display: "block",}}>regístrate y chatea.</span>
                </h2>
            </div>
            <div style={{marginLeft: "3.7vh", marginRight:"3.7vh"}}>

                    <div className="form-group" >
                        <label for="InputName" className='label'>Nombre</label>
                        <input type="text" className="form-control input inputText" id="InputName" placeholder="Nombre" ref={inputRefName}/>
                    </div>
                    <div className="form-group">
                        <label for="InputEmail" className='label'>Email</label>
                        <input type="email" className="form-control input inputText" id="InputEmail"  aria-describedby="emailHelp" placeholder="Email" ref={inputRefEmail}/>
                    </div>
                    <div className="form-group">
                        <label for="InputAge" className='label'>Edad</label>
                        <input type="number" className="form-control input inputText" id="InputAge" placeholder="Edad" ref={inputRefEdad} onInput={handleAgeInput}/>
                    </div>
                    <div style={{marginTop: "2vh"}}>
                        <button onClick={onClickLogIn} className=" btn-primary button" >Continuar</button>
                    </div>

            </div>
        </div>
    );
}
export default Login;
