// Build-time replacement for Google auth in M0. No external endpoints, tokens,
// script injection or account state exist in the privacy demo bundle.
export const orgDomainHint = () => "";
export const isGoogleConfigured = () => false;
export const getUser = () => null;
export const isSignedIn = () => false;
export const domainAllows = () => false;
export const isAllowedDomain = () => false;
export const preloadGoogle = async () => {};
export const onAuthChange = () => () => {};
export const signOut = () => {};
export async function signIn() { throw new Error("A Google-integráció az M0 adatvédelmi módban ki van kapcsolva."); }
export async function getAccessToken() { throw new Error("A Google-integráció az M0 adatvédelmi módban ki van kapcsolva."); }
