import React from "react";
import { useNavigate }  from "react-router-dom";

function HomePage(){
    const navigate = useNavigate();
    return(
        <div>
            <h1>Welcome to home page</h1>
            <button 
            onClick={() => navigate("/dashboard")}>
                Dashboard
            </button>
        </div>
    )
}

export default HomePage;