import { useState } from "react";

function Login({ homeowner, onLogin, onLogout }) {
  const [email, setEmail] = useState("bill@example.com");
  const [password, setPassword] = useState("1234");

  if (homeowner) {
    return (
      <div className="login-box">
        <p>Logged in as {homeowner.name}</p>
        <button onClick={onLogout}>Log Out</button>
      </div>
    );
  }

  return (
    <div className="login-box">
      <h2>Homeowner Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={() => onLogin(email, password)}>Log In</button>
    </div>
  );
}

export default Login;