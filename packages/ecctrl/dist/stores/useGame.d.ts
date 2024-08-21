import * as THREE from "three";
export declare const useGame: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<State>, "subscribe"> & {
    subscribe: {
        (listener: (selectedState: State, previousSelectedState: State) => void): () => void;
        <U>(selector: (state: State) => U, listener: (selectedState: U, previousSelectedState: U) => void, options?: {
            equalityFn?: (a: U, b: U) => boolean;
            fireImmediately?: boolean;
        }): () => void;
    };
}>;
export type AnimationSet = {
    idle?: string;
    walk?: string;
    run?: string;
    jump?: string;
    jumpIdle?: string;
    jumpLand?: string;
    fall?: string;
    action1?: string;
    action2?: string;
    action3?: string;
    action4?: string;
};
type State = {
    moveToPoint: THREE.Vector3;
    isCameraBased: boolean;
    curAnimation: string;
    animationSet: AnimationSet;
    initializeAnimationSet: (animationSet: AnimationSet) => void;
    reset: () => void;
    setMoveToPoint: (point: THREE.Vector3) => void;
    getMoveToPoint: () => {
        moveToPoint: THREE.Vector3;
    };
    setCameraBased: (isCameraBased: boolean) => void;
    getCameraBased: () => {
        isCameraBased: boolean;
    };
} & {
    [key in keyof AnimationSet]: () => void;
};
export {};
