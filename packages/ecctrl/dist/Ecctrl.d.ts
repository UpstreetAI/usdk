import { RapierRigidBody, type RigidBodyProps } from "@react-three/rapier";
import { type ReactNode } from "react";
import React from "react";
export { EcctrlAnimation } from "./EcctrlAnimation";
export { useFollowCam } from "./hooks/useFollowCam";
export { useGame } from "./stores/useGame";
export { EcctrlJoystick } from "../src/EcctrlJoystick";
export { useJoystickControls } from "./stores/useJoystickControls";
declare const _default: React.ForwardRefExoticComponent<EcctrlProps & React.RefAttributes<RapierRigidBody>>;
export default _default;
export type camListenerTargetType = "document" | "domElement";
export interface EcctrlProps extends RigidBodyProps {
    children?: ReactNode;
    debug?: boolean;
    capsuleHalfHeight?: number;
    capsuleRadius?: number;
    floatHeight?: number;
    characterInitDir?: number;
    followLight?: boolean;
    disableFollowCam?: boolean;
    disableFollowCamPos?: {
        x: number;
        y: number;
        z: number;
    };
    disableFollowCamTarget?: {
        x: number;
        y: number;
        z: number;
    };
    camInitDis?: number;
    camMaxDis?: number;
    camMinDis?: number;
    camUpLimit?: number;
    camLowLimit?: number;
    camInitDir?: {
        x: number;
        y: number;
    };
    camTargetPos?: {
        x: number;
        y: number;
        z: number;
    };
    camMoveSpeed?: number;
    camZoomSpeed?: number;
    camCollision?: boolean;
    camCollisionOffset?: number;
    fixedCamRotMult?: number;
    camListenerTarget?: camListenerTargetType;
    followLightPos?: {
        x: number;
        y: number;
        z: number;
    };
    maxVelLimit?: number;
    turnVelMultiplier?: number;
    turnSpeed?: number;
    sprintMult?: number;
    jumpVel?: number;
    jumpForceToGroundMult?: number;
    slopJumpMult?: number;
    sprintJumpMult?: number;
    airDragMultiplier?: number;
    dragDampingC?: number;
    accDeltaTime?: number;
    rejectVelMult?: number;
    moveImpulsePointY?: number;
    camFollowMult?: number;
    camLerpMult?: number;
    fallingGravityScale?: number;
    fallingMaxVel?: number;
    wakeUpDelay?: number;
    rayOriginOffest?: {
        x: number;
        y: number;
        z: number;
    };
    rayHitForgiveness?: number;
    rayLength?: number;
    rayDir?: {
        x: number;
        y: number;
        z: number;
    };
    floatingDis?: number;
    springK?: number;
    dampingC?: number;
    showSlopeRayOrigin?: boolean;
    slopeMaxAngle?: number;
    slopeRayOriginOffest?: number;
    slopeRayLength?: number;
    slopeRayDir?: {
        x: number;
        y: number;
        z: number;
    };
    slopeUpExtraForce?: number;
    slopeDownExtraForce?: number;
    showHeadRayOrigin?: boolean;
    headRayOriginOffest?: number;
    headRayLength?: number;
    headRayDir?: {
        x: number;
        y: number;
        z: number;
    };
    autoBalance?: boolean;
    autoBalanceSpringK?: number;
    autoBalanceDampingC?: number;
    autoBalanceSpringOnY?: number;
    autoBalanceDampingOnY?: number;
    animated?: boolean;
    mode?: string;
    controllerKeys?: {
        forward?: number;
        backward?: number;
        leftward?: number;
        rightward?: number;
        jump?: number;
        action1?: number;
        action2?: number;
        action3?: number;
        action4?: number;
    };
    props?: RigidBodyProps;
}
export interface userDataType {
    canJump?: boolean;
    slopeAngle?: number | null;
    characterRotated?: boolean;
    isOnMovingObject?: boolean;
    excludeEcctrlRay?: boolean;
}
