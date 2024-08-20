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
    <div className="flex flex-col md:flex-row items-center justify-between w-full">
      {stages.map((stage, index) => (
        <div
          key={index}
          className={`flex flex-col items-center ${index <= stageIndex ? 'text-orange-600' : 'text-gray-400'} mb-4 md:mb-0`}
          style={{ width: '100%', maxWidth: '120px' }}
        >
          <div
            className={`rounded-full flex items-center justify-center w-10 h-10 md:w-12 md:h-12 mb-2 md:mb-2 ${index < stageIndex ? 'bg-orange-500' : index === stageIndex ? 'bg-orange-600' : 'bg-gray-300'} text-white`}
          >
            {stage.icon}
          </div>
          <span className={`text-xs md:text-sm font-medium ${index <= stageIndex ? 'text-orange-600' : 'text-gray-400'}`}>{stage.name}</span>
          {index < stages.length && (
            <div className={`w-1 md:w-2 h-6 md:h-8 ${index < stageIndex ? 'bg-orange-600' : index === stageIndex ? 'bg-orange-600' : 'bg-gray-300'} md:mx-2`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default OrderStages;
