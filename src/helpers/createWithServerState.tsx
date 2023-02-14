import React, { createContext, ReactNode, useContext } from "react"
import { TObject } from "../controller"

export const createServerStateProvider = <State extends TObject,>() => {
    const context = createContext<State | null >(null)
    
    return {
        ServerStateProvider({ children, state }: {children:  ReactNode, state: State}){
            return <context.Provider value={state}>{children}</context.Provider>
        },
        useServerStateProvider(){
            return useContext(context)
        }
    } 
}
