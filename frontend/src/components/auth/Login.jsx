import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/api'; // Verifică dacă calea e corectă către api.js

const Login = () => {
    const [email, setEmail] = useState('');
    const [parola, setParola] = useState('');
    const [eroare, setEroare] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setEroare(''); // Resetăm erorile vechi

        try {
            const data = await AuthService.login({ email, parola });

            if (data.status) {
                console.log("Login reușit! Token salvat.");
                navigate('/dashboard'); // Sau unde vrei să trimiți userul după login
            }
        } catch (err) {
            setEroare("Email sau parolă incorectă. Te rugăm să încerci din nou.");
            console.error("Eroare login:", err);
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleLogin} style={styles.card}>
                <h2 style={styles.title}>Autentificare Tabere</h2>

                {eroare && <p style={styles.error}>{eroare}</p>}

                <div style={styles.inputGroup}>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="exemplu@mail.com"
                        style={styles.input}
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label>Parolă:</label>
                    <input
                        type="password"
                        value={parola}
                        onChange={(e) => setParola(e.target.value)}
                        required
                        placeholder="********"
                        style={styles.input}
                    />
                </div>

                <button type="submit" style={styles.button}>Intră în cont</button>
            </form>
        </div>
    );
};

// Câteva stiluri rapide (Inline CSS pentru a fi siguri că merge din prima)
const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7f6' },
    card: { padding: '40px', borderRadius: '10px', backgroundColor: '#fff', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', width: '350px' },
    title: { textAlign: 'center', marginBottom: '20px', color: '#333' },
    inputGroup: { marginBottom: '15px', display: 'flex', flexDirection: 'column' },
    input: { padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ddd' },
    button: { width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' },
    error: { color: 'red', fontSize: '14px', marginBottom: '10px', textAlign: 'center' }
};

export default Login;