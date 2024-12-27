import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';

const BarGraph = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartInstance, setChartInstance] = useState(null);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8800/pictorialstockdata');
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error fetching data. Please try again later.');
        setLoading(false);
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

      const sortedData = [...data].sort((a, b) => (a.quantity - a.available) - (b.quantity - b.available)).reverse();

      // Take top N items (e.g., top 5)
      const topN = 3;
      const topData = sortedData.slice(0, topN);

      const labels = data.map(item => item.brand);
      const quantities = data.map(item => item.quantity);
      const availabilities = data.map(item => item.available);

      // Calculate orders for each item
      const orders = quantities.map((quantity, index) => quantity - availabilities[index]);

      const ctx = document.getElementById('myChart').getContext('2d');
      const newChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Orders',
              data: orders, // Use the orders array for data
              backgroundColor: '#89e8ac', // Red color scheme
              borderColor: '#929c96', // Red color scheme
              borderWidth: 1,
            },
          ],
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: 'Orders for each product',
              font: {
                size: 16,
                weight: 'bold',
              },
            },
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)',
              },
              ticks: {
                font: {
                  size: 12,
                  weight: 'bold',
                },
              },
            },
            x: {
              grid: {
                display: false,
              },
              ticks: {
                font: {
                  size: 12,
                  weight: 'bold',
                },
              },
            },
          },
        },
      });

      // Store the new chart instance
      setChartInstance(newChartInstance);

      // Set top products for rendering
      setTopProducts(topData);
    }
  }, [data]);

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-9">
          <div className="bar-graph-container">
            <div className="chart-container">
              {loading && <div>Loading...</div>}
              {error && <div>{error}</div>}
              <canvas id="myChart"></canvas>
            </div>
          </div>
        </div>
        <div className="col-md-3">
        <div className="top-products" style={{ border: "2px solid #ccc", padding: "20px", borderRadius: "10px", marginTop: "20px" }}>
  <p className="top-products-title" style={{ fontWeight: "bold", fontSize: "18px", marginBottom: "10px", textAlign: "center" }}>Top Products</p>
  <ul className="top-products-list" style={{ listStyle: "none", padding: "0" }}>
    {topProducts.map((product, index) => (
      <li key={product.id} className={`top-product-item animate__animated animate__fadeIn delay-${index + 1}s`} style={{ marginBottom: "10px", display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f9f9f9", borderRadius: "5px", padding: "10px" }}>
        <div className="top-product-details" style={{ flex: "1" }}>
          <h4 className="top-product-brand" style={{ fontSize: "13px", margin: "0",fontWeight:"600" }}>{product.title}</h4>
          <p className="top-product-price" style={{ margin: "5px 0", color: "#555",fontWeight:"500" }}>Price: {product.product_cost}</p>
        </div>
       
      </li>
    ))}
  </ul>
</div>

        </div>
      </div>
    </div>
  );
};

export default BarGraph;
