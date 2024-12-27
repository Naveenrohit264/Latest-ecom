import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2'; // Use Bar chart for amount
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const GstDetails = () => {
  const [products, setProducts] = useState([]); // State to store all product data
  const [filteredProducts, setFilteredProducts] = useState([]); // State for filtered products based on category
  const [searchQuery, setSearchQuery] = useState(''); // State to store the search query
  const [category, setCategory] = useState(''); // State to store the selected category
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const rowsPerPage = 5; // Display 5 rows at a time

  useEffect(() => {
    // Fetch all products data from the API
    axios
      .get('http://localhost:8800/gstdetails') // Replace with your actual backend API endpoint
      .then((response) => {
        setProducts(response.data);
        setFilteredProducts(response.data); // Initially show all products
      })
      .catch((error) => console.error('Error fetching products:', error));
  }, []);

  // Handle category selection
  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
    if (event.target.value === '') {
      setFilteredProducts(products); // Show all products if no category is selected
    } else {
      const filtered = products.filter((product) => product.category === event.target.value);
      setFilteredProducts(filtered);
    }
    setCurrentPage(1); // Reset to the first page when category changes
  };

  // Filter products based on search query (for table display only)
  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    
    // Filter products based on the search query
    const filtered = products.filter((product) => {
      return (
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.brand.toLowerCase().includes(query.toLowerCase()) ||
        product.id.toString().includes(query) ||
        product.gst_percentage.toString().includes(query)
      );
    });

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Handle pagination
  const indexOfLastProduct = currentPage * rowsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - rowsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Change page handler
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Pagination: Calculate total pages
  const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);

  // Graph Rendering (Bar Chart for GST Amount)
  const renderGraph = () => {
    const data = {
      labels: filteredProducts.map((product) => product.title), // Product titles as X-axis labels
      datasets: [
        {
          label: 'GST Amount (₹)',
          data: filteredProducts.map((product) => product.product_cost * (product.gst_percentage / 100)), // GST amounts as data points
          backgroundColor: 'rgba(75, 192, 192, 0.6)', // Bar color
          borderColor: 'rgba(75, 192, 192, 1)', // Bar border color
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `GST Amount for ${category || 'All Products'}`,
        },
        tooltip: {
          callbacks: {
            label: function (tooltipItem) {
              const amount = tooltipItem.raw;
              const percentage = filteredProducts[tooltipItem.dataIndex].gst_percentage;
              return `₹${amount.toFixed(2)} (${percentage}%)`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true, // Ensures the Y-axis starts at 0
          min: 10, // Ensures the Y-axis does not go below zero
          ticks: {
            callback: function(value) {
              if (value === 0) return '0';  // Ensures 0 is labeled correctly
              return `₹${value}`; // Format ticks as currency
            }
          },
        },
      },
    };

    // Dynamically adjust the width of the chart based on the number of filtered products
    const chartWidth = filteredProducts.length === 1 ? '40%' : '80%'; // If only one product, set width to 40%

    const chartContainerStyle = {
      width: chartWidth,
      height: '400px',
      marginTop: '20px',
      marginLeft: 'auto', // Center align the chart
      marginRight: 'auto',
    };

    return (
      <div style={chartContainerStyle}>
        <Bar data={data} options={options} />
      </div>
    );
  };

  const containerStyle = {
    margin: '20px',
    padding: '20px',
    backgroundColor: '#f4f7fb',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  };

  const headerStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: '20px',
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    fontSize: '14px',
  };

  const thStyle = {
    padding: '10px',
    textAlign: 'center',
    border: '1px solid #ddd',
    backgroundColor: '#4CAF50',
    color: 'white',
  };

  const tdStyle = {
    padding: '10px',
    textAlign: 'center',
    border: '1px solid #ddd',
  };

  const trEvenStyle = {
    backgroundColor: '#f2f2f2',
  };

  const trHoverStyle = {
    backgroundColor: '#ddd',
  };

  const paginationStyle = {
    textAlign: 'center',
    marginTop: '20px',
    paddingBottom: '20px', // Space between pagination and graph
  };

  const paginationItemStyle = {
    margin: '0 5px',
    cursor: 'pointer',
    fontWeight: 'normal',
    color: '#333',
    padding: '5px 10px',
    borderRadius: '5px',
    transition: 'background-color 0.3s',
  };

  const paginationActiveItemStyle = {
    backgroundColor: '#4CAF50',
    color: 'white',
    fontWeight: 'bold',
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>GST Details</h2>

      {/* Category Filter Dropdown */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <select
          value={category}
          onChange={handleCategoryChange}
          style={{
            padding: '10px',
            width: '80%',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
          }}
        >
          <option value="">All Categories</option>
          <option value="Men's Fashion">Men's Fashion</option>
          <option value="Women">Women's Fashion</option>
          <option value="Electronics">Electronics</option>
          <option value="Appliances">Appliances</option>
          <option value="Kids">Kids</option>
        </select>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <input
          type="text"
          placeholder="Search by Product Name, Brand, ID or GST"
          value={searchQuery}
          onChange={handleSearchChange}
          style={{
            padding: '10px',
            width: '80%',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
          }}
        />
      </div>

      {/* Table Section */}
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Product Id</th>
            <th style={thStyle}>Product Name</th>
            <th style={thStyle}>Brand</th>
            <th style={thStyle}>Category</th>
            <th style={thStyle}>Product Cost</th>
            <th style={thStyle}>GST Percentage</th>
            <th style={thStyle}>GST Amount</th>
          </tr>
        </thead>
        <tbody>
          {currentProducts.map((product, index) => (
            <tr
              key={product.id}
              style={index % 2 === 0 ? trEvenStyle : {}}
              onMouseEnter={(e) => (e.target.style.backgroundColor = trHoverStyle.backgroundColor)}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '')}
            >
              <td style={tdStyle}>{product.id}</td>
              <td style={tdStyle}>{product.title}</td>
              <td style={tdStyle}>{product.brand}</td>
              <td style={tdStyle}>{product.category}</td>
              <td style={tdStyle}>{product.product_cost}</td>
              <td style={tdStyle}>{product.gst_percentage}%</td>
              <td style={tdStyle}>
                ₹{(product.product_cost * (product.gst_percentage / 100)).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Section */}
      <div style={paginationStyle}>
        {Array.from({ length: totalPages }, (_, index) => (
          <span
            key={index + 1}
            onClick={() => paginate(index + 1)}
            style={
              currentPage === index + 1
                ? { ...paginationItemStyle, ...paginationActiveItemStyle }
                : paginationItemStyle
            }
          >
            {index + 1}
          </span>
        ))}
      </div>

      {renderGraph()}
    </div>
  );
};

export default GstDetails;
