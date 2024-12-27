import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/authContext";
import Header from "./Header";
import { Link } from "react-router-dom";
import StarRateIcon from '@mui/icons-material/StarRate';
import { jsPDF } from "jspdf"; // Import jsPDF
import GetAppIcon from '@mui/icons-material/GetApp'; // Import the GetApp icon
import "jspdf-autotable";

function Orders() {
  const { currentUser } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [cancellationReason, setCancellationReason] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [gstDetails, setGstDetails] = useState([]);
  const baseURL = "http://localhost:8800";
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const userId = currentUser?.id;
      if (userId) {
        const response = await axios.get(`${baseURL}/userorders?userId=${userId}`);
        const sortedOrders = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setOrders(sortedOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  // Fetch GST details
  const fetchGstDetails = async () => {
    try {
      const response = await axios.get(`${baseURL}/gstdetails`);
      setGstDetails(response.data);
    } catch (error) {
      console.error("Error fetching GST details:", error);
    }
  };

  useEffect(() => {
    fetchOrders(); // Fetch orders on initial load
    fetchGstDetails(); // Fetch GST details on initial load
  }, [currentUser?.id]);

  const handleCancelOrder = (orderId) => {
    setCancellationReason("");
    setSelectedOrderId(orderId);
  };

  const handleCancelReason = () => {
    setCancellationReason("");
    setSelectedOrderId(null);
  };

  const handleReturnOrder = (orderId) => {
    console.log(`Return order with ID ${orderId}`);
  };

  const showConfirmationPopupWithTimeout = () => {
    setShowConfirmationPopup(true);
    setTimeout(() => {
      handleConfirmationPopupClose();
    }, 2000);
  };

  const handleSubmitCancellation = async () => {
    try {
      await axios.put(`${baseURL}/cancel/${selectedOrderId}`, {
        status: "cancelled",
        cancellationReason: cancellationReason,
      });
      await fetchOrders(); // Refresh the orders
      setCancellationReason("");
      setSelectedOrderId(null);
      showConfirmationPopupWithTimeout();
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleConfirmationPopupClose = () => {
    setShowConfirmationPopup(false);
  };

  const handleDownloadInvoice = (order) => {
    const orderDetails = gstDetails.find(gst => gst.id === order.product_id);
    if (orderDetails) {
        const doc = new jsPDF();

        // Add title
        const pageWidth = doc.internal.pageSize.getWidth();
        const title = "TaxInvoice";
        const titleFontSize = 14;

        doc.setFont('helvetica', 'bold'); // Set font to Helvetica and bold
        doc.setFontSize(titleFontSize);
        doc.setTextColor(0, 0, 0);

        const textWidth = doc.getTextWidth(title);
        const xPos = (pageWidth - textWidth) / 2;
        doc.text(title, xPos, 20);

        // Add horizontal line at the top
        doc.setDrawColor(0, 0, 0); // Black color for the line
        doc.setLineWidth(0.5); // Line thickness
        doc.line(10, 25, pageWidth - 10, 25); // Draw line from left to right

        // Adding company name, contact info, and GST number
        doc.setFontSize(7);
        doc.text("Company Name: Brightcomgroup.", 14, 30);
        doc.text("Address: 1234 Street, City, State", 14, 35);
        doc.text("Phone: (123) 456-7890", 14, 40);
        doc.text("Email: contact@abccorp.com", 14, 45);
        doc.text("GST Number: 29ABCDE1234F1Z5", 14, 50); // Example GST Number

        // Add Shipping Address
        const shippingAddressText = `Shipping Address:\n${order.address}`;
        const shippingAddressWidth = doc.getTextWidth(shippingAddressText);
        const xPosShipping = (pageWidth - shippingAddressWidth) / 2;

        // Space between Company details and Shipping address
        const spaceBetweenCompanyAndShipping = 60;  // Adjust this value to position it correctly

        doc.setFontSize(9);
        doc.text(shippingAddressText, xPosShipping, spaceBetweenCompanyAndShipping);

        // Add order details (Including Unique Invoice Number)
        const uniqueInvoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`; // Unique Invoice Number
        doc.setFontSize(7);
        doc.text(`Invoice Number: ${uniqueInvoiceNumber}`, 150, 30);
        doc.text(`Order ID: ${order.order_id}`, 150, 35);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 40);

        // Define table headers and data
        const head = ["Order ID", "Title", "Quantity", "Price", "CGST", "SGST", "Total Price"];
        const cgst = orderDetails.gst_amount / 2; // Assuming equal CGST & SGST split
        const sgst = orderDetails.gst_amount / 2;
        const totalPrice = parseFloat(order.price);

        const data = [
            [
                order.order_id,
                order.title,
                order.quantity.toString(),
                order.price.toString(),
                cgst.toFixed(2),
                sgst.toFixed(2),
                totalPrice.toFixed(2)
            ]
        ];

        // Add table with autoTable
        doc.autoTable({
            startY: spaceBetweenCompanyAndShipping + 20, // Adjusted position after shipping address
            head: [head],
            body: data,
            theme: 'grid', // Grid to ensure all cells have borders
            margin: { top: 80, left: 14, right: 14 },
            headStyles: {
                fillColor: [255, 255, 255], // White background for header
                textColor: [0, 0, 0], // Black text for header
                fontSize: 8,
                fontStyle: 'bold',
                halign: 'center',
                valign: 'middle',
                lineWidth: 0.5, // Border thickness
                lineColor: [0, 0, 0] // Black border
            },
            bodyStyles: {
                fillColor: [255, 255, 255], // White background for body
                fontSize: 8,
                cellPadding: 4,
                lineWidth: 0.5, // Border thickness
                fontStyle: 'normal',
                lineColor: [0, 0, 0], // Black border
                halign: 'center',
                valign: 'middle'
            },
            columnStyles: {
                0: { cellWidth: 25 },
                1: { cellWidth: 35 },
                2: { cellWidth: 25 },
                3: { cellWidth: 30 },
                4: { cellWidth: 25 },
                5: { cellWidth: 25 },
                6: { cellWidth: 25 },
                7: { cellWidth: 30 },
                8: { cellWidth: 30 }
            },
            styles: {
                overflow: 'linebreak',
                cellWidth: 'auto'
            },
            pageBreak: 'auto',
            didDrawPage: function (data) {
                const pageHeight = doc.internal.pageSize.height;
                const currentY = doc.lastAutoTable.finalY || 60;

                if (currentY > pageHeight - 20) {
                    doc.addPage();
                }
            },
            foot: [
                ["", "", "", "", "", "", `Total Amount = ${totalPrice.toFixed(2)}`]
            ],
            footStyles: {
                fillColor: [255, 255, 255], // No background for the footer
                lineWidth: 0.5, // Border thickness
                lineColor: [0, 0, 0], // Black border
                textColor: [0, 0, 0], // Black text
                fontSize: 8,
                fontStyle: 'normal',
                halign: 'center',
                valign: 'middle',
                cellPadding: 4
            },
            // Removing vertical lines in the footer except start and end
            columnStyles: {
                0: { cellWidth: 25, cellPadding: 4 },  // First column (with border)
                6: { cellWidth: 30, cellPadding: 4 },  // Last column (with border)
            }
        });

        // Add horizontal line at the bottom before saving
        const bottomLineYPos = doc.autoTable.previous.finalY + 10; // Position after the table
        doc.line(10, bottomLineYPos, pageWidth - 10, bottomLineYPos);

        // Footer with "Thank you" message centered
        const thankYouText = "Thank you for your business!";
        const thankYouTextWidth = doc.getTextWidth(thankYouText);
        const thankYouXPos = (pageWidth - thankYouTextWidth) / 2;
        const thankYouYPos = bottomLineYPos + 10; // Position after line
        doc.setFontSize(10);
        doc.text(thankYouText, thankYouXPos, thankYouYPos);

        // Save the PDF
        doc.save(`invoice_${order.order_id}.pdf`);
    }
};









  return (
    <div>
      <Header />
     <div style={{ padding: "30px", marginTop: "5%", background: "#f9f9f9" }}>
  <h2
    style={{
      color: "#005087",
      paddingBottom: "20px",
      textAlign: "center",
      fontSize: "2rem",
      fontWeight: "600",
    }}
  >
    Your Orders
  </h2>
  {orders.length === 0 ? (
    <p style={{ textAlign: "center", color: "#777", fontSize: "1.2rem" }}>
      No orders to display
    </p>
  ) : (
    <ul
  style={{
    listStyle: "none",
    padding: 0,
    marginTop: "20px",
    maxWidth: "800px", // Restricts the width
    margin: "0 auto", // Centers the content
  }}
>
  {orders.map((order) => (
    <li
      key={order.order_id}
      style={{
        marginBottom: "25px",
        backgroundColor: "#f8f9fa",
        borderRadius: "12px",
        boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
        transition: "transform 0.3s ease-in-out",
        border: "1px solid #e9ecef",
      }}
    >
      {/* Product Details Section */}
      <Link
        to={`/productdetails/${order.product_id}`}
        style={{
          textDecoration: "none",
          display: "block",
          padding: "20px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <img
          src={`${baseURL}/${order.image_path}`}
          alt={order.title}
          style={{
            width: "90px",
            height: "90px",
            borderRadius: "8px",
            marginRight: "15px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        />
        <div>
          <h3
            style={{
              margin: 0,
              color: "#212529",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            {order.title}
          </h3>
          <p
            style={{
              margin: "8px 0 0",
              fontSize: "14px",
              color: "#495057",
            }}
          >
            Status:{" "}
            <span
              style={{
                color: order.status === "delivered" ? "#28a745" : "#dc3545",
                fontWeight: "600",
              }}
            >
              {order.status}
            </span>
          </p>
        </div>
      </Link>

      {/* Actions Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "15px 20px",
          borderTop: "1px solid #e9ecef",
          backgroundColor: "#fff",
        }}
      >
        {/* Rate and Review Section */}
       {/* Actions Section */}
<div
  style={{
    flex: 1,
    textAlign: "center",
    color: "#495057",
    fontSize: "16px",
    fontWeight: "500",
  }}
>
  {order.status === "delivering" ? (
    <button
      onClick={() => handleCancelOrder(order.order_id)}
      style={{
        padding: "10px 20px",
        borderRadius: "5px",
        background: "#dc3545",
        color: "#fff",
        border: "none",
        fontWeight: "600",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
      }}
    >
      Cancel
    </button>
  ) : order.status === "delivered" ? (
    <Link
      to={`/Rating/${order.product_id}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#007bff",
        textDecoration: "none",
      }}
    >
      <StarRateIcon
        style={{
          color: "#ffc107",
          marginRight: "5px", // Adjusted margin for alignment
          fontSize: "20px",
        }}
      />
      Rate and Review
    </Link>
  ) : null} {/* Default case when the order is neither 'delivering' nor 'delivered' */}
</div>


        {/* Download Invoice Section */}
        <div style={{ flex: 1, textAlign: "right" }}>
          {order.status === "delivered" && (
            <GetAppIcon
              onClick={() => handleDownloadInvoice(order)}
              style={{
                fontSize: "24px",
                color: "#343a40",
                cursor: "pointer",
                transition: "color 0.3s ease",
              }}
              onMouseOver={(e) => (e.target.style.color = "#007bff")}
              onMouseOut={(e) => (e.target.style.color = "#343a40")}
            />
          )}
        </div>
      </div>
    </li>
  ))}
</ul>

  
  
  
  
  
  )}

  {selectedOrderId && (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.5)",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "#fff",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
          width: "400px",
        }}
      >
        <h3 style={{ marginBottom: "20px", color: "#005087" }}>
          Provide a reason for cancellation
        </h3>
        <textarea
          value={cancellationReason}
          onChange={(e) => setCancellationReason(e.target.value)}
          placeholder="Enter your reason here..."
          style={{
            width: "100%",
            minHeight: "100px",
            marginTop: "10px",
            borderRadius: "4px",
            padding: "10px",
            fontSize: "14px",
            border: "1px solid #ccc",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "20px",
          }}
        >
          <button
            onClick={handleCancelReason}
            style={{
              background: "#f44336",
              color: "#fff",
              padding: "12px 25px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitCancellation}
            style={{
              background: "#005087",
              color: "#fff",
              padding: "12px 25px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  )}

  {showConfirmationPopup && (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "#4CAF50",
        color: "white",
        padding: "20px",
        borderRadius: "4px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        zIndex: 1000,
      }}
    >
      Order has been successfully cancelled!
    </div>
  )}
</div>

    </div>
  );
}

export default Orders;
