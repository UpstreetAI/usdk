import React from 'react';

const FeatureForm = ({ featureSpec, featureName, features, setFeatures }) => {

  const inputClass = 'w-60 px-4 py-2 bg-[#E4E8EF] border-2 border-[#475461] text-gray-900 text-sm w-full mb-2';
  const textareaClass = 'w-full px-4 py-2 bg-[#E4E8EF] border-2 border-[#475461] text-gray-900 text-sm mb-2 resize-none';


  const renderFormElement = (key, config) => {
    switch (config.type) {
      case 'text':
        return (
          <div key={key}>
            <label className="text-black">
              {config.label}
              <input
                type="text"
                value={features[featureName] && features[featureName][key]}
                className={inputClass}
                onChange={(e) => setFeatures({
                  ...features,
                  [featureName]: {
                    ...features[featureName],
                    [key]: e.target.value
                  }
                })}
                placeholder={config.description}
              />
            </label>
          </div>
        );
      case 'number':
        return (
          <div key={key}>
            <label htmlFor={key} className="text-black">
              {config.label}
              <input
                id={key}
                type="number"
                value={features[featureName] && features[featureName][key]}
                className={inputClass}
                onChange={(e) => setFeatures({
                  ...features,
                  [featureName]: {
                    ...features[featureName],
                    [key]: parseInt(e.target.value, 10)
                  }
                })}
                placeholder={config.description}
              />
            </label>
          </div>
        );
      case 'select':
        return (
          <div key={key}>
            <label className="text-black">
              {config.label}
              <select
                value={features[featureName] && features[featureName][key]}
                className={inputClass}
                onChange={(e) => setFeatures({
                  ...features,
                  [featureName]: {
                    ...features[featureName],
                    [key]: e.target.value
                  }
                })}
              >
                {config.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        );
      case 'checkbox':
        return (
          <div key={key}>
            <label className="text-black">
              <input
                type="checkbox"
                checked={features[featureName] && features[featureName][key]}
                onChange={(e) => setFeatures({
                  ...features,
                  [featureName]: {
                    ...features[featureName],
                    [key]: e.target.checked
                  }
                })}
              />
              {config.label}
            </label>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {Object.entries(featureSpec.form).map(([key, config]) => { 
        console.log("features: ", features);
        return renderFormElement(key, config)
      })}
    </>
  );
};

export default FeatureForm;