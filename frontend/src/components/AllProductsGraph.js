import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';
import './Bargraph.css'; // Import CSS file for styling

const BarGraph = () => {
  const [data, setData] = useState([]);
  const [chartInstance, setChartInstance] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8800/pictorialstockdata');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Update chart whenever data changes
    if (data.length > 0) {
      if (chartInstance) {
        // Destroy existing chart instance
        chartInstance.destroy();
      }

      const labels = data.map(item => item.brand);
      const quantities = data.map(item => item.quantity);
      const availabilities = data.map(item => item.available);

      const ctx = document.getElementById('myChart').getContext('2d');
      const newChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Quantity',
              data: quantities,
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
            {
              label: 'Available',
              data: availabilities,
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });

      // Store the new chart instance
      setChartInstance(newChartInstance);
    }
  }, [data]);

  return (
    <div className="bar-graph-container">
   

    
      <h2 className="graph-title" style={{textAlign:"center"}}>Product Quantity and Availability</h2>
      <div className="chart-container">
        <canvas id="myChart"></canvas>
      </div>
    </div>
  );
};

export default BarGraph;
