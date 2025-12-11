import React, { useState } from 'react';

const Tabs = ({ children }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabs = React.Children.toArray(children);

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b-2 border-leather mb-4 pb-2 bg-gradient-to-b from-parchment to-parchment-dark" role="tablist">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            role="tab"
            aria-selected={activeIndex === index}
            aria-controls={`tabpanel-${index}`}
            id={`tab-${index}`}
            tabIndex={activeIndex === index ? 0 : -1}
            className={`
              px-4 py-2 rounded-t-lg font-semibold
              transition-all duration-200 transform
              border-2 border-b-0
              ${
                activeIndex === index
                  ? 'bg-leather text-parchment-light border-brass shadow-horror translate-y-1 text-shadow'
                  : 'bg-parchment-dark text-leather-dark border-leather-light hover:bg-leather-light hover:text-parchment shadow-sm hover:translate-y-0.5'
              }
            `}
          >
            {tab.props.title}
          </button>
        ))}
      </div>
      <div
        className="space-y-3"
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
