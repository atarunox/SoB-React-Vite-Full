import React, { useState } from 'react';

const Tabs = ({ children }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabs = React.Children.toArray(children);

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-gray-300 mb-4" role="tablist">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            role="tab"
            aria-selected={activeIndex === index}
            aria-controls={`tabpanel-${index}`}
            id={`tab-${index}`}
            tabIndex={activeIndex === index ? 0 : -1}
            className={`px-3 py-1 rounded-t ${
              activeIndex === index
                ? 'bg-yellow-300 text-black font-bold'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tab.props.title}
          </button>
        ))}
      </div>
      <div
        className="space-y-2"
        role="tabpanel"
        id={`tabpanel-${activeIndex}`}
        aria-labelledby={`tab-${activeIndex}`}
        tabIndex={0}
      >
        {tabs[activeIndex]}
      </div>
    </div>
  );
};

export default Tabs;
