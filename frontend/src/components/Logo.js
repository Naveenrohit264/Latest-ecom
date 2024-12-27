import React from 'react';

function Logo() {
  const logoStyle = {
    position: 'fixed',
    top: '0',
    left: '0',
    margin: '10px',
  };

  const imageSize = {
    width: '150px',  // Adjust the width as needed
    height: 'auto',
  };

  return (
    <div style={logoStyle}>
      <img src={process.env.PUBLIC_URL + '/flybuy.png'} alt="FlyBuy Logo" style={imageSize} />
    </div>
  );
}

export default Logo;
