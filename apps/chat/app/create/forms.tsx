import React from 'react';

const FeatureForm = ({ featureSpec, featureName, features, setFeatures }) => {
  const renderFormElement = (key, config) => {
    switch (config.type) {
      case 'text':
        return (
          <div key={key}>
            <label>
              {config.label}
              <input
                type="text"
                value={features[featureName] && features[featureName][key]}
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
            <label>
              {config.label}
              <input
                type="number"
                value={features[featureName] && features[featureName][key]}
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
            <label>
              {config.label}
              <select
                value={features[featureName] && features[featureName][key]}
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
            <label>
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