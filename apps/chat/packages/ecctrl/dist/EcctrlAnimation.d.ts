import { type AnimationSet } from "./stores/useGame";
import React from "react";
export declare function EcctrlAnimation(props: EcctrlAnimationProps): React.JSX.Element;
export type EcctrlAnimationProps = {
    characterURL: string;
    animationSet: AnimationSet;
    children: React.ReactNode;
};
