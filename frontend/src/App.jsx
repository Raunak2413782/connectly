import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SearchUsers from "./pages/SearchUsers";
import FriendRequests from "./pages/FriendRequests";
import Friends from "./pages/Friends";
import Chat from "./pages/Chat";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/search" element={<SearchUsers />} />
        <Route path="/requests" element={<FriendRequests />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/chat/:friendId" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;