import React from "react";

const disabled = async () => { throw new Error("A Google-integráció az M0 adatvédelmi módban ki van kapcsolva."); };
const value = { user: null, ready: true, configured: false, signIn: disabled, signOut: () => {} };

export function GoogleAuthProvider({ children }) { return <>{children}</>; }
export function useGoogleAuth() { return value; }
