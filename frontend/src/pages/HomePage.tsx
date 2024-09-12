import React, { useState } from 'react';
import Layout from '../components/Layout/Layout';
import Card from '../components/Home/HomeCard';
import CardDetails from '../components/Home/CardDetails';

const HomePage: React.FC = () => {
  const cards = [
    { id: 1, title: 'Delivery Orders', content: 'Details of Delivery Orders', iconType: 'Delivery' as 'Delivery' },
    { id: 2, title: 'Dining Orders', content: 'Details of Dining Orders', iconType: 'Dining' as 'Dining' },
    { id: 3, title: 'Takeaway Orders', content: 'Details of Takeaway Orders', iconType: 'Takeaway' as 'Takeaway' },
  ];

  const [selectedCard, setSelectedCard] = useState(cards[0]);

  return (
    <Layout>
      <div className="grid grid-cols-12 gap-4 p-4 h-full">
        {/* Sidebar */}
        <div className="col-span-12 md:col-span-3 lg:col-span-2 space-y-6 flex flex-col items-center">
          {cards.map((card) => (
            <div key={card.id}>
              <Card 
                card={card} 
                onClick={() => setSelectedCard(card)} 
                isActive={selectedCard?.id === card.id} 
              />
            </div>
          ))}
        </div>
        
        {/* Card Details */}
        <div className="col-span-12 md:col-span-9 lg:col-span-10">
          <CardDetails selectedCard={selectedCard} />
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
