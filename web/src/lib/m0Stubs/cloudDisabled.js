const disabled = () => { throw new Error("A felhőszinkron az M0 adatvédelmi módban ki van kapcsolva."); };
export const createDrive = disabled;
export const createCloudStore = disabled;
export const createGraphDrive = disabled;
export const buildM365Store = disabled;
export const buildLocalFirstStore = disabled;
export const createMsalAuth = disabled;
export default disabled;
