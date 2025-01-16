import React, { createContext, useState } from "react";

const ElementContextRoute = createContext();

const ElementProviderRoute= ({ children }) => {
  const [route, setRoute] = useState("Login");
  const [id, setId] = useState(null);
  const changeRoute = (newValue) => {
    console.log( newValue);
    setRoute(newValue);
  };

  return (
    <ElementContextRoute.Provider value={{ route, changeRoute, setId, id}}>
      {children}
    </ElementContextRoute.Provider>
  );
};

export { ElementContextRoute, ElementProviderRoute };
