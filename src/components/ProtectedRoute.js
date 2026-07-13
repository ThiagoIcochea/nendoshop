import { Navigate } from "react-router-dom";
import { ROUTES } from "../utils/secureRoutes";

function ProtectedRoute({children}){
    const isAuth = localStorage.getItem("auth");
    return isAuth ? children : <Navigate to = {ROUTES.login} />
}

export default ProtectedRoute;
