import { useState } from "react";
import "./LoginPage.css";

function LoginPage({ onLogin }: { onLogin: () => void }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    async function submit() {
        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        if (res.ok) onLogin();
        else alert("Login failed");
    }

    return (
        <form
            className="login-form"
            onSubmit={e => {
                e.preventDefault();
                submit();
            }}
        >
            <div className="form-field">
                <label htmlFor="username">Username</label>
                <input
                    id="username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    autoComplete="username"
                />
            </div>

            <div className="form-field">
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                />
            </div>

            <button type="submit">Login</button>
        </form>
    );
}

export { LoginPage };
