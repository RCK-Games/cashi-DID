import "../styles/Login.css";
import { useContext, useRef, useState } from "react";
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { ElementContextRoute } from "../context/RouteContext";

function Login() {
  const inputRefName = useRef(null);
  const inputRefEmail = useRef(null);
  const inputRefEdad = useRef(null);
  const [inputNameError, setInputNameError] = useState(null);
  const [inputEmailError, setInputEmailError] = useState(null);
  const [inputEdadError, setInputEdadError] = useState(null);
  const { changeRoute, setId } = useContext(ElementContextRoute);

  const onClickLogIn = async () => {
    if (inputChecker() === false) {
      return;
    }else{
      const response = fetch("https://cashi.rckgames.com/back/api/v1/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: inputRefName.current.value,
          email: inputRefEmail.current.value,
          age: inputRefEdad.current.value,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Error en el servidor");
          }
          return response.json();
        })
        .then((data) => {
          changeRoute("Main");
          setId(data.id);
        });
    }

  };
  const handleAgeInput = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value > 99) e.target.value = 99;
    if (value < 0 || isNaN(value)) e.target.value = "";
  };

  const inputChecker = () => {
    const emailValue = inputRefEmail.current.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let internalName = false
    let internalEmail = false
    let internalEdad = false

    if (inputRefName.current.value.trim() === "") {
      setInputNameError(true)
      internalName = true
    }
    if (inputRefEmail.current.value.trim() === "") {
      setInputEmailError(true)
      internalEmail = true
    }
    if (!emailRegex.test(emailValue)) {
      setInputEmailError(true)
      internalEmail = true
    }
    if (inputRefEdad.current.value.trim() === "") {
      setInputEdadError(true)
      internalEdad = true
    }

    if (
      internalEdad === true ||
      internalEmail === true ||
      internalName === true
    ) {
      return false;
    } else {
      setInputNameError(false)
      setInputEmailError(false)
      setInputEdadError(false)
      return true;
    }
  };

  return (
    <div className="background">
      <div>
        <h1 className="titleLogin">Cashimiro AI</h1>
        <h2 className="subTitleLogin">
          Bienvenidos a Cashimiro,
          <span style={{ display: "block" }}>regístrate y chatea.</span>
        </h2>
      </div>
      <div
        style={{ width: "100vw", display: "flex", justifyContent: "center" }}
      >
        <div style={{ width: "80vw", maxWidth: "800px" }}>
          <div className="form-group">
            <label for="InputName" className="label">
              Nombre
            </label>
            <input
              type="text"
              className="form-control input inputText"
              id="InputName"
              placeholder="Nombre"
              ref={inputRefName}
            />
            {inputNameError === true && (
              <p className="errorText">Porfavor escriba su nombre</p>
            )}
            
          </div>
          <div className="form-group">
            <label for="InputEmail" className="label">
              Email
            </label>
            <input
              type="email"
              className="form-control input inputText"
              id="InputEmail"
              aria-describedby="emailHelp"
              placeholder="Email"
              ref={inputRefEmail}
            />
            {inputEmailError === true && (
              <p className="errorText">Porfavor escriba su edad</p>
            )}
            
          </div>
          <div className="form-group">
            <label for="InputAge" className="label">
              Edad
            </label>
            <input
              type="number"
              className="form-control input inputText"
              id="InputAge"
              placeholder="Edad"
              ref={inputRefEdad}
              onInput={handleAgeInput}
            />
            {inputEdadError === true && (
              <p className="errorText">Porfavor escriba su edad</p>
            )}
            
          </div>
          <div style={{ marginTop: "2vh" }}>
            <button onClick={onClickLogIn} className=" btn-primary button">
              Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Login;
