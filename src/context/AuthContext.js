import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [auth, setAuth] = useState(() => {

    const savedAuth = localStorage.getItem("auth");

    return savedAuth ? JSON.parse(savedAuth) : null;

  });

  useEffect(() => {

    if (auth) {

      localStorage.setItem(
        "auth",
        JSON.stringify(auth)
      );

    } else {

      localStorage.removeItem("auth");

    }

  }, [auth]);

  return (

    <AuthContext.Provider value={{ auth, setAuth }}>

      {children}

    </AuthContext.Provider>

  );
}