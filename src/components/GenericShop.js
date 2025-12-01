import React from 'react';
import { tabsByShop } from './TownScreen'; // adjust path if needed
import ItemCard from './ItemCard';
import Tabs from './Tabs';
import TabPanel from './TabPanel';

const GenericShop = ({ shopKey, title }) => {
  const tabs = tabsByShop[shopKey];

  if (!tabs) return <p>No data for this location.</p>;

  return (
    <div className="bg-white border rounded-lg p-4 shadow space-y-4">
      <h3 className="text-xl font-bold">{title}</h3>
      <Tabs>
        {tabs.map(tab => (
          <TabPanel key={tab.id} title={tab.label}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tab.items.map((item, idx) => (
                <ItemCard key={idx} item={item} />
              ))}
            </div>
          </TabPanel>
        ))}
      </Tabs>
    </div>
  );
};

export default GenericShop;
