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
    <div className="flex flex-col md:flex-row items-center justify-between mt-6 px-4">
      {stages.map((stage, index) => (
        <div
          key={index}
          className={`flex flex-col items-center ${index <= stageIndex ? 'text-green-600' : 'text-gray-400'} mb-4 md:mb-0`}
          style={{ width: '100%', maxWidth: '120px' }}
        >
          <div
            className={`rounded-full flex items-center justify-center w-12 h-12 md:w-16 md:h-16 mb-2 md:mb-2 ${index <= stageIndex ? 'bg-green-600' : 'bg-gray-300'} text-white`}
          >
            {stage.icon}
          </div>
          <span className="text-sm md:text-base font-medium">{stage.name}</span>
          {index < stages.length - 1 && (
            <div className={`w-1 md:w-2 h-12 md:h-16 ${index < stageIndex ? 'bg-green-600' : 'bg-gray-300'} md:mx-2`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default OrderStages;
