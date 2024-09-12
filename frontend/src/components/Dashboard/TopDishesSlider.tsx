import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { TopDish } from '@/types';
import { Link } from 'react-router-dom';

const TopDishesSlider = ({ topDishes }: { topDishes: TopDish[]}) => {
  return (
    <div className="w-full py-8">
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={10}
        slidesPerView={3}
        navigation
        pagination={{ clickable: true }}
        className="mySwiper"
      >
        {topDishes.map((dish: any, index: number) => (
          <SwiperSlide key={index}>
            <div className="flex flex-col items-center">
              <img 
                src={`${import.meta.env.VITE_APP_MEDIA_URL}/${dish.dish__image}`} 
                alt={dish.dish__name} 
                className="w-48 h-48 object-cover mb-2 rounded"
              />
              <Link to='/dishes' className='absolute bg-red-500 p-2 top-1 rounded-xl text-white'>Order Now</Link>
              <p className="text-center font-semibold">{dish.dish__name}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default TopDishesSlider;