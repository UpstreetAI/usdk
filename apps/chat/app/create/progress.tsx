import React, { useState } from 'react';
import { Icon } from 'ucom';

interface ProgressProps {
  step: number;
}

const Progress: React.FC<ProgressProps> = ({ step }) => {

  const getProgressWidth = () => {
    switch (step) {
      case 1:
        return "0%";
      case 2:
        return "66%";
      case 3:
        return "100%";
      default:
        return "0%";
    }
  };

  const getStepClass = (currentStep: number) => {
    return step >= currentStep ? "bg-gray-900 text-white" : "bg-white text-gray-900 border-2 border-gray-200";
  };

  return (
    <div className="w-full py-6">
      <div className="flex justify-center">
        <div className="w-1/3">
          <div className="relative mb-2">
            <div className={`w-10 h-10 mx-auto ${getStepClass(1)} rounded-full text-lg flex items-center`}>
              <span className="text-center text-white w-full">
                <Icon icon="Tiling" className="size-5 mx-auto" />
              </span>
            </div>
          </div>
          <div className="text-xs text-center md:text-base">Select Features</div>
        </div>

        <div className="w-1/3">
          <div className="relative mb-2">
            <div className="absolute flex align-center items-center align-middle content-center" style={{
              width: "calc(100% - 2.5rem - 1rem)",
              top: "50%",
              transform: "translate(-50%, -50%)"
            }}>
              <div className="w-full bg-gray-200 rounded items-center align-middle align-center flex-1">
                <div className="w-0 bg-gray-900 py-1 rounded" style={{ width: step > 1 ? "100%" : "0%" }}></div>
              </div>
            </div>

            <div className={`w-10 h-10 mx-auto ${getStepClass(2)} rounded-full text-lg flex items-center`}>
              <span className="text-center w-full">
                <Icon icon="Chat" className="size-5 mx-auto" />
              </span>
            </div>
          </div>
          <div className="text-xs text-center md:text-base">Test Agent</div>
        </div>

        <div className="w-1/3">
          <div className="relative mb-2">
            <div className="absolute flex align-center items-center align-middle content-center"
              style={{
                width: "calc(100% - 2.5rem - 1rem)",
                top: "50%",
                transform: "translate(-50%, -50%)"
              }}>
              <div className="w-full bg-gray-200 rounded items-center align-middle align-center flex-1">
                <div className="w-0 bg-gray-900 py-1 rounded"
                  style={{ width: step > 2 ? "100%" : "0%" }}>
                </div>
              </div>
            </div>

            <div className={`w-10 h-10 mx-auto ${getStepClass(3)} rounded-full text-lg flex items-center`}>
              <span className="text-center w-full">
                <Icon icon="Upload" className="size-5 mx-auto" />
              </span>
            </div>
          </div>
          <div className="text-xs text-center md:text-base">Deploy</div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
