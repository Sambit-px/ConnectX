import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const withAuth = (WrappedComponent) => {
    const AuthComponent = (props) => {
        const navigate = useNavigate();
        const location = useLocation();

        const isAuthenticated = () => !!localStorage.getItem("token");

        useEffect(() => {
            if (!isAuthenticated()) {
                // Save where the user was trying to go
                navigate("/auth", { state: { from: location.pathname } });
            }
        }, []);

        return <WrappedComponent {...props} />;
    };

    return AuthComponent;
};

export default withAuth;