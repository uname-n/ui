import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { GlobalContext, DefaultGlobalState } from './context';

import Dashboard from './page/dashboard';
import Plugin from './page/plugin';

import './index.css';

function Application() {
    const [globalstate, update] = useState(JSON.parse(localStorage.getItem("globalstate")) || DefaultGlobalState);

    const compare = (obj1, obj2) => JSON.stringify(obj1) === JSON.stringify(obj2);
    const merge = (obj1, obj2) => {
        const result = { ...obj1 };
        for (const key in obj2) {
            if (obj2.hasOwnProperty(key)) {
                if (typeof obj2[key] === 'object' && !Array.isArray(obj2[key]) && obj2[key] !== null) {
                    result[key] = merge(obj1[key] || {}, obj2[key]);
                } else {
                    result[key] = obj2[key];
                }
            }
        }
        return result;
    };

    const save = () => fetch("/api/settings", { method: "POST", body: JSON.stringify(globalstate, null, 4) });
    const reset = () => fetch("/api/settings")
        .then(res => res.json())
        .then(res => res.error ? {} : res)
        .then(res => update(merge(DefaultGlobalState, res)))
        .catch(() => save());

    useEffect(() => {
        localStorage.setItem("globalstate", JSON.stringify(globalstate));
    }, [globalstate]);

    useEffect(() => {
        window.addEventListener("storage", (e) => {
            const { key, newValue } = e;
            if (key === "globalstate") update(JSON.parse(newValue));
        });

        if (compare(globalstate, DefaultGlobalState)) reset();
    }, []);

    return (
        <BrowserRouter>
            <GlobalContext.Provider value={{ globalstate, update, save, reset }}>
                <Routes>
                    <Route path="/" element={<Plugin />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
            </GlobalContext.Provider>
        </BrowserRouter>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Application />);
