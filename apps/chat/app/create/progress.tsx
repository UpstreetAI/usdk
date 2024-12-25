import React from 'react';
import { Icon } from 'ucom';

interface ProgressProps {
  steps: {
    title: string;
    Icon: string;
    description: string;
  }[];
  currentStep: number;
}

const Progress: React.FC<ProgressProps> = ({ steps, currentStep }) => {
  const getStepClass = (step: number) => 
    currentStep > step ? "bg-gray-900 text-white" : "bg-white text-gray-900 border-2 border-gray-200";

  return (
    <div className="w-full py-6">
      <div className="flex justify-center">
        {steps.map((step, index) => (
          <div key={index} className="w-1/3">
            <div className="relative mb-2">
              {index > 0 && (
                <div
                  className="absolute flex align-center items-center align-middle content-center"
                  style={{
                    width: "calc(100% - 2.5rem - 1rem)",
                    top: "50%",
                    transform: "translate(-50%, -50%)"
                  }}
                >
                  <div className="w-full bg-gray-200 rounded items-center align-middle align-center flex-1">
                    <div
                      className="w-0 bg-gray-900 py-1 rounded"
                      style={{ width: index < currentStep ? "100%" : "0%" }}
                    />
                  </div>
                </div>
              )}
              <div className={`w-10 h-10 mx-auto ${getStepClass(index)} rounded-full text-lg flex items-center`}>
                <span className="text-center w-full">
                  <Icon icon={step.Icon} className="size-5 mx-auto" />
                </span>
              </div>
            </div>
            <div className="text-xs text-center md:text-base">{step.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Progress;
