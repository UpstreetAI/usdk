export declare const useJoystickControls: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<State>, "subscribe"> & {
    subscribe: {
        (listener: (selectedState: State, previousSelectedState: State) => void): () => void;
        <U>(selector: (state: State) => U, listener: (selectedState: U, previousSelectedState: U) => void, options?: {
            equalityFn?: (a: U, b: U) => boolean;
            fireImmediately?: boolean;
        }): () => void;
    };
}>;
type State = {
    curJoystickDis: number;
    curJoystickAng: number;
    curRunState: boolean;
    curButton1Pressed: boolean;
    curButton2Pressed: boolean;
    curButton3Pressed: boolean;
    curButton4Pressed: boolean;
    curButton5Pressed: boolean;
    setJoystick: (joystickDis: number, joystickAng: number, runState: boolean) => void;
    resetJoystick: () => void;
    pressButton1: () => void;
    pressButton2: () => void;
    pressButton3: () => void;
    pressButton4: () => void;
    pressButton5: () => void;
    releaseAllButtons: () => void;
    getJoystickValues: () => {
        joystickDis: number;
        joystickAng: number;
        runState: boolean;
        button1Pressed: boolean;
        button2Pressed: boolean;
        button3Pressed: boolean;
        button4Pressed: boolean;
        button5Pressed: boolean;
    };
};
export {};
