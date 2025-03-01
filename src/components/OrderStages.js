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
            className={`rounded-full flex items-center justify-center ${index < stageIndex ? 'bg-orange-500' : index === stageIndex ? 'bg-orange-600' : 'bg-gray-300'} text-white mb-2 transition-all duration-300 transform hover:scale-110`}
            style={{ width: '48px', height: '48px', fontSize: '20px' }}
          >
            {stage.icon}
          </div>
          <span className={`text-sm font-medium ${index <= stageIndex ? 'text-orange-600' : 'text-gray-400'} transition-colors duration-300`}>{stage.name}</span>
          {index < stages.length - 1 && (
            <div className={`w-1 md:w-2 h-6 md:h-8 ${index < stageIndex ? 'bg-orange-600' : index === stageIndex ? 'bg-orange-600' : 'bg-gray-300'} mx-2 transition-colors duration-300`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default OrderStages;