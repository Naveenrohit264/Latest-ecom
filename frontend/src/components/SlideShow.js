import React from 'react'

import './SlideShow.css'
//const colors = ["#0088FE", "#00C49F", "#FFBB28"];
const offers = ['https://i.ibb.co/PxtPp2J/banner.jpg','https://i.ibb.co/MCQ6wpC/banner1.jpg','https://i.ibb.co/c2L2p8T/banner2.jpg']
const delay = 2500;

function Slideshow() {
  const [index, setIndex] = React.useState(0);
  const timeoutRef = React.useRef(null);

  function resetTimeout() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }

  React.useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(
      () =>
        setIndex((prevIndex) =>
          prevIndex === offers.length - 1 ? 0 : prevIndex + 1
        ),
      delay
    );

    return () => {
      resetTimeout();
    };
  }, [index]);

  return (
    <div className="slideshow">
      <div
        className="slideshowSlider"
        style={{ transform: `translate3d(${-index * 100}%, 0, 0)` }}
      >
        

        {offers.map((backgroundColor, index) => (
          <img
            src={backgroundColor}
            alt='offers'
            className="slide"
            key={index}
            
          />
        ))}
      </div>

      <div className="slideshowDots">
        {offers.map((_, idx) => (
          <div
            key={idx}
            className={`slideshowDot${index === idx ? " active" : ""}`}
            onClick={() => {
              setIndex(idx);
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}


export default Slideshow
