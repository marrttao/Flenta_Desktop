import { useContext, type Context } from "react";

import { AuthContext as LegacyAuthContext } from "../components/authContext";

import type { AuthContextValue } from "../types";



const AuthContext = LegacyAuthContext as unknown as Context<AuthContextValue | null>;



function useAuth(): AuthContextValue
{
	const value = useContext(AuthContext);

	if (!value) { throw new Error("useAuth must be used within an AuthProvider"); }

	return value;
}



export { AuthContext };

export { useAuth };