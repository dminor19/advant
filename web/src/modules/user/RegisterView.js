import React, { useState } from 'react';

export const RegisterView = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <div>
                <input
                    type="text"
                    name="email"
                    placeholder="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
            </div>
            <div>
                <input
                    type="password"
                    name="password"
                    placeholder="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
            </div>
            <div>
                <button onClick={() => console.log('hi')}>register</button>
            </div>
        </div>
    );
};
