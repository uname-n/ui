import { createContext } from "react";

export const GlobalContext = createContext(null);

export const DefaultGlobalState = {
    setting: {
        abc: "default-value"
    },
    wow: {
        count: 0,
        notcount: 42
    }
}
