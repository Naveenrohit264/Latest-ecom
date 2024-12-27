import React from 'react';
import { Typography, styled } from '@mui/material';
import { navData } from '../components/data';

const NavBarContainer = styled('div')`
  display: flex;
  justify-content: space-evenly; /* Set to space-evenly for equal spacing */
  margin: 55px 130px 0 130px !important;

  @media (max-width: 1280px) {
    margin: 0 !important;
  }
`;


const NavItem = styled('div')`
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: transform 0.2s; /* Added transition for smoother animation */
    cursor: pointer;

    /* Animation on hover */
    &:hover {
        animation: glow 1s infinite alternate; /* Define glow animation */
    }

    /* Glow animation */
    @keyframes glow {
        0% {
            transform: scale(1); /* Normal scale */
            filter: brightness(100%); /* Normal brightness */
        }
        100% {
            transform: scale(1.1); /* Slightly larger scale */
            filter: brightness(150%); /* Brighter glow */
        }
    }
`;

const NavImage = styled('img')`
    width: 64px;
`;

const NavText = styled(Typography)`
    font-size: 14px;
    font-weight: 600;
`;

const Items = () => {
    return (
        <NavBarContainer>
            {
                navData.map((temp, index) => (
                    <NavItem key={index}>
                        <NavImage src={temp.url} alt={`nav${index}`} />
                        <NavText>{temp.text}</NavText>
                    </NavItem>
                ))
            }
        </NavBarContainer>
    );
};

export default Items;