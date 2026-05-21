import { useState } from "react";

function Login({ homeowner, onLogin, onRegister, onLogout }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("Bill L.");
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
      <h2>{mode === "login" ? "Homeowner Login" : "Homeowner Register"}</h2>

      {mode === "register" && (
        <input
          type="text"
          placeholder="Name, example: Bill L."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      )}

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

      {mode === "login" && (
        <button onClick={() => onLogin(email, password)}>Log In</button>
      )}

      {mode === "register" && (
        <button onClick={() => onRegister(name, email, password)}>
          Register
        </button>
      )}

      {mode === "login" && (
        <button onClick={() => setMode("register")}>
          Need an account? Register
        </button>
      )}

      {mode === "register" && (
        <button onClick={() => setMode("login")}>
          Already have an account? Log In
        </button>
      )}
    </div>
  );
}

export default Login;