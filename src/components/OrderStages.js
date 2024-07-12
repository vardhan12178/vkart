import React from 'react';

const OrderStages = ({ currentStage }) => {
  const stages = [
    { name: 'Shipping', icon: '📦' },
    { name: 'Shipped', icon: '✈️' },
    { name: 'Out for Delivery', icon: '🚚' },
    { name: 'Delivered', icon: '🎉' }
  ];

  const stageIndex = stages.findIndex(stage => stage.name === currentStage);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-4">
      {stages.map((stage, index) => (
        <div key={index} className={`flex items-center ${index <= stageIndex ? 'text-gray-900' : 'text-gray-600'} mb-2 md:mb-0`} style={{ width: 'calc(100% / 4)' }}>
          <div className="rounded-full bg-gray-800 text-white flex items-center justify-center w-18 h-6 md:w-8 md:h-8 mr-2 md:mr-4">
            {stage.icon}
          </div>
          <span className="md:block text-center">{stage.name}</span>
        </div>
      ))}
    </div>
  );
};

export default OrderStages;
