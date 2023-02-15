import React, { createContext, useContext } from "react"
import { ServerStateProviderComponent } from "../types"

export const createServerStateProvider = <State,>() => {
    const context = createContext<State | null >(null)
    
    const ServerStateProvider: ServerStateProviderComponent<State> = ({state, children}) => {
        return <context.Provider value={state}>{children}</context.Provider>
    }
    const useServerStateProvider = () => useContext(context)

    return {
        ServerStateProvider,
        useServerStateProvider
    } 
}
