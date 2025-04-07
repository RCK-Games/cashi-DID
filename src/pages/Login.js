import "../styles/Login.css";
import { useContext, useState } from "react";
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { ElementContextRoute } from "../context/RouteContext";

function Login() {
  const [termsAndConditions, setTermsAndConditions] = useState(false);
  const [termsAndConditionsError, setTermsAndConditionsError] = useState(false);
  const { changeRoute } = useContext(ElementContextRoute);

  const onClickLogIn = async () => {
    if(termsAndConditions){
      changeRoute("Main");
    }else{
      setTermsAndConditionsError(true);
    }

  };

  const onClickCheckBox = async () => {
    setTermsAndConditions(!termsAndConditions);
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
        style={{ width: "100vw", display: "flex", justifyContent: "center", flexFlow: "column", alignItems: "center" }}
      >
        <div style={{display: "flex", flexFlow: "row", width: "100vw", justifyContent: "center", paddingRight: "10px", margin: "0px"}}>
        <label className="containerInput2">
        <input onClick={onClickCheckBox} type="checkbox" />
        <div className="checkmark" />
      </label>
        <p className="subTitleLogin" style={{fontSize:"15px", paddingTop: "20px", textAlign: "left", margin: "0px"}}>
          He leído y acepto los,
          <a href="https://www.google.com">terminos y condiciones</a>
        </p>
        
        </div>
        {termsAndConditionsError === true && (
              <p className="errorText">Porfavor acepte los terminos y condiciones antes de continuar</p>
            )}
        <div style={{width: "200px", margin: "0px",}}>
          <button onClick={onClickLogIn} className=" btn-primary button">
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
export default Login;
