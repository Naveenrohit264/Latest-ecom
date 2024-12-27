import React from 'react';

import Header from './Header';
import SlideShow from './SlideShow';

import './Home.css';
import ProductList from './ProductList';
import Items from './Items';




const Home = () => {
 

  return (
    <div className='whole-home-page-container'>
      <Header />
     
      <div>
    </div>
    
        <SlideShow />
       
        <div>
            <ProductList />
        </div>
    </div>
    
  );
};

export default Home;
