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
    <div className="flex flex-row flex-wrap items-center justify-between w-full px-2">
      {stages.map((stage, index) => (
        <div
          key={index}
          className={`flex flex-col items-center ${index <= stageIndex ? 'text-orange-600' : 'text-gray-400'} mb-4`}
          style={{ flex: '1 0 auto', maxWidth: '120px' }}
        >
          <div
            className={`rounded-full flex items-center justify-center ${index < stageIndex ? 'bg-orange-500' : index === stageIndex ? 'bg-orange-600' : 'bg-gray-300'} text-white mb-1 transition-transform duration-300`}
            style={{ width: '40px', height: '40px', fontSize: '18px' }}
          >
            {stage.icon}
          </div>
          <span className={`text-xs md:text-sm font-medium ${index <= stageIndex ? 'text-orange-600' : 'text-gray-400'} transition-colors duration-300`}>{stage.name}</span>
          {index < stages.length && (
            <div className={`w-1 md:w-2 h-4 md:h-6 ${index < stageIndex ? 'bg-orange-600' : index === stageIndex ? 'bg-orange-600' : 'bg-gray-300'} mx-2 transition-colors duration-300`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default OrderStages;
