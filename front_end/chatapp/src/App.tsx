import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Login from "./Pages/Login";
import Chat from "./Pages/Chat";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/Login" element={<Login/>}/>
                <Route path="/Chat" element={<Chat/>}/>
                <Route path="/*" element={<Login/>}/>
            </Routes>
        </Router>
    );
}

export default App;