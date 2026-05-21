import { ref, push, onValue, remove, update } from "firebase/database";
import { db } from "./firebase";
import "./App.css";
import MenuCard from "./MenuCard";
import BottomNav from "./BottomNav";

import americano from "./assets/americano.jpg";
import latte from "./assets/latte.jpg";
import cappuccino from "./assets/cappuccino.jpg"; 
import { useEffect, useState } from "react";
import {BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,} from "recharts";
import toast, { Toaster } from "react-hot-toast";


function App() {
   const [cart, setCart] = useState([]);
   
   const [customerName, setCustomerName] = useState("");
   const [orders, setOrders] = useState([]);
   const [orderNumber, setOrderNumber] = useState(1);
   const [searchText, setSeachText] = useState("");
   const [currentTime, setCurrentTime] = useState( new Date());
   const [darkMode, setDarkMode] = useState(false);
   const [selectedOrder, setSelectedOrder] = useState(null);
   const [activeSection, setActiveSection] = useState("dashboard")

   useEffect(() => {
    const handleScroll = () => {
      const sections = ["dashboard", "menu", "orders"];

      sections.forEach((section) => {
        const element = document.getElementById(section);

        if(element) {
          const rect = element.getBoundingClientRect();

          if (rect.top <= 160 && rect.bottom >= 160) {
            setActiveSection(section);
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
   }, []
  );

   useEffect(() => {
  const savedOrders = localStorage.getItem("orders");

  if (savedOrders) {
    setOrders(JSON.parse(savedOrders));
  }

  }, []);
 
  useEffect(() => {
    localStorage.setItem("orders",  JSON.stringify(orders));
  },[orders]);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");

    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
      localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const saveOrderNumber = localStorage.getItem("orderNumber");

    if(saveOrderNumber) {
      setOrderNumber(JSON.parse(saveOrderNumber));
    }
  }, []);

  useEffect (() => {
    localStorage.setItem("orderNumber", JSON.stringify(orderNumber));
  }, [orderNumber]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect (() => {
    const ordersRef = ref(db, "orders");

    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();

      if(data) {
        const firebaseOrders = Object.entries(data).map(([id, order]) => ({
          id,
          ...order,
          items: order.cart || [],
        }) );

        setOrders(firebaseOrders);
      } else {
        setOrders([]);
      }
    });
  }, []);

  const updateStatus = async (id, currentStatus) => {
    let newStatus = "Pending";

    if (currentStatus === "Pending") {
      newStatus = "Preparing";

   } else if (currentStatus === "Preparing") {
     newStatus = "Done";
   } else if (currentStatus === "Done") {
    newStatus = "Pending";
   }

     await update(ref(db,`orders/${id}`), {
     status : newStatus,
   });
  };


  const menu = [
    {
      id: 1,
      name: "Americano",
      price: 50,
      image: americano,
      type: "Hot",
    },

     {
      id: 2,
      name: "Latte",
      price: 60,
      image: latte,
      type: "Hot",
    },

     {
      id: 3,
      name: "Cappuccino",
      price: 70,
      image: cappuccino,
      type: "Hot",
    },
  ];

  const addToCart = (newItem) => {
    const existingItem = cart.find(
      (item) => 
      item.id === newItem.id &&
      item.type === newItem.type &&
      item.sweetness === newItem.sweetness
);
  

  if (existingItem) {
    const updatedCart = cart.map((item) =>
    item.id === newItem.id &&
    item.type === newItem.type &&
    item.sweetness === newItem.sweetness
    ? { ...item, quantity: item.quantity + 1}
    : item
  );

     setCart(updatedCart);
      } else {
        setCart([...cart, { ...newItem, quantity: 1}]);
      }

    
 
  };

  const increaseQuantity = (id) => {

    const updatedCart = cart.map((item) => 
    item.id === id
    ? {
      ...item,
      quantity: item.quantity + 1,
    }
      : item
    );

      setCart(updatedCart);
  };
   
  const decreaseQuantity = (id) => {

      const updatedCart = cart.map((item) => 
    item.id === id
    ? {...item, quantity: item.quantity - 1 }
      : item
    )
      .filter((item) => item.quantity > 0);
      
      setCart(updatedCart);
      };

  const clearCart = () => {
    setCart([]);
  };

  const deleteOrder = (id) => {
    const updatedOrders = orders.filter(
      (order) => order.id !== id
    );

    setOrders(updatedOrders);

  }

 const submitOrder = () => {
    if (cart.length === 0) {
      alert("Cart is empty");
      return
    }
   
     if (customerName.trim() === "") {
      alert("Please enter customer name")
      return;
    }

    const nextOrderNumber = orders.length + 1;

    const orderRef = ref(db, "orders");

    push(orderRef, {
      customerName,
      cart,
      total: totalPrice,
      orderNumber: nextOrderNumber,
      createdAt: Date.now(),
    });

    const newOrder = {
      id: Date.now(),
      customerName: customerName,
      items: cart,
      total: totalPrice,
      orderNumber: nextOrderNumber,
      status: "Pending",
      createdAt: new Date().toLocaleString(),
    };

    setOrders([...orders, newOrder]);
    setCart([]);
    setCustomerName("");

    toast.success("Order submitted ☕");

  };

  const totalPrice = cart.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  const totalItems = cart.reduce((sum, item) => {
    return sum + item.quantity;
  }, 0);

  const filteredOrders = orders.filter((order) => 
      (order.customerName || "")
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  const totalOrders = orders.length;

  const totalRevenue = orders.reduce((sum, order) => {
    return sum + order.total;
  }, 0);
   
  const totalCupsSold = orders.reduce((sum, order) => {
    return (
      sum + 
      order.items.reduce((itemSum, item) => {
        return itemSum + item.quantity;
      }, 0)
    );
  }, 0)

  const chartData = [
    {
      name: "Orders",
      value: totalOrders,
    },

    {
      name: "Revenue",
      value: totalRevenue,
    },

    {
      name: "Cups",
      value: totalCupsSold,
    },
  ]

  

  return (

    
    <div className={darkMode ? "dark app-wrapper" : "app-wrapper"}>
     <div className="navbar">
      <div className="logo">
            <h1>Tui Cafe ☕</h1>
      </div>
      <div className="clock-box">
        

        <h2 className="header-date">
          {currentTime.toLocaleDateString()}
        </h2>

      </div>
    
      <div className="nav-links">
        <a href="#dashboard" className={activeSection === "dashboard" ? "active-link" : ""}>Dashboard</a>

        <a href="#menu" className={activeSection === "menu" ? "active-link" : ""}>Menu</a>

        <a href="#orders" className={activeSection === "orders" ? "active-link" : ""}>Orders</a>

        <button className="theme-btn" onClick={() => setDarkMode(!darkMode)}>{darkMode ? 
         "☀️ Light" : "🌙 Dark" }</button>
      </div>
  </div>
    <Toaster/>
    <a href="#cart" className="floating-cart">
       🛒 {cart.length}
     
    </a>
   

   

    


    <div id="dashboard" className="cart-box">

    <h2 className="section-title">Cart: {cart.length === 0 && (
      <span className="cart-empty-text">
           <p>Your cart is empty ☕ </p>
      </span>
     
    )}</h2>

    {cart.map((item, index) => (
      <div key={index} className="cart-item">
        <p>{item.type}</p>
          <p>{item.sweetness}</p>

          <p>
            {item.name} x {item.quantity}
          </p>

           <p>
            {item.price} x {item.quantity}
          </p>

          <div>
            <button onClick={() => decreaseQuantity(item.id)}>
              -
            </button>

            <button onClick={() => increaseQuantity(item.id)}>
              +
            </button>
          </div>
          </div>
     
    ) )}

    <h2>Total: {totalPrice} THB</h2>

    <input 
          type="text"
          placeholder="Search customer..."
          value={searchText}
          onChange={(e) => setSeachText(e.target.value)}
    />
    
   
   

      <button className="action-btn" onClick={clearCart}>  🗑  Clear Cart</button>

      <button className="action-btn" onClick={submitOrder}> Submit Order </button>
  </div>
   
   <div id="cart" className="cart-box">
        
       <input
          type="text"
          placeholder="Enter your name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
       />
   
         <h3>Hello, {customerName}</h3>
    </div>
    
        
   <div id="menu" className="menu-grid">
       {menu.map((item) => (
        <MenuCard 
          key={item.id}
          id={item.id}
          name={item.name}
          price={item.price}
          image={item.image}
          addToCart={addToCart}
        />
      ))}
   </div>
            // Move
      <div id="cart" className="cart-box">
    <div id="orders">
        <h2 className="section-title"> Order History</h2>
   
   

    {orders.length === 0 ? (
      <div className="empty-state">
        <div className="empty-icon">☕</div>
            <h3>No orders yet </h3>
            <p>when customers submit orders, they will appear here.</p>
      </div>
      
    ) : (
        filteredOrders.map((order) => (
        <div key={order.id} className="order-card">
          <h3>Order #{String(order.orderNumber).padStart(3,"0")}</h3>
          <h3>Customer: {order.customerName}</h3>
          <p>Total: {order.total} Baht</p>
          <p className={`order-status ${
            order.status === "Done" ? "done" : order.status === "Preparing"
            ? "preparing" : "pending"
          }`}
          >
             {order.status || "Pending"}</p>

          <button
            className="action-btn"
            onClick={() =>
                updateStatus(order.id, order.status || "Pending")
            }
          >
           Update Status
          </button>
          <button
          className="delete-btn"
          onClick={() => deleteOrder(order.id)}>
            Delete Order
            </button>

            <button className="action-btn" onClick={() => setSelectedOrder(order)}>
              View Receipt
            </button>

          {order.items.map((item) => (
            <p key={item.id}>
              {item.name} x {item.quantity}
            </p>
))}            
        </div>
      ))
   )}

   </div>
</div>
              

          // Move here
   <div id="cart" className="cart-box">
    <div className="stats-grid">
        <div className="stats-box">
          <p>Total Orders</p>
          <h2>{totalOrders}</h2>
        </div>

        <div className="stats-box">
          <p>Total Revenue</p>
          <h2>{totalRevenue}</h2>
        </div>

        <div className="stats-box">
          <p>Cups Sold</p>
          <h2>{totalCupsSold}</h2>
        </div>
    </div>

    <div className="chart-box">
      <h2 className="section-title">
           Cafe Analytics
      </h2>

      <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
          
            <Bar dataKey="value" fill="#8b5e3c" radius={[14, 14, 0, 0]} />
            <Tooltip contentStyle={{
              borderRadius: "14px",
              border: "none",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)",
            }}
            />

          </BarChart>
      </ResponsiveContainer>

    </div>

            // To here
  {selectedOrder && (
    <div className="modal-bg">
    <div className="receipt-modal">

         <h2>☕ Tui Cafe</h2>

         <p className="receipt-date">
             {selectedOrder.createdAt || "No date"}
         </p>

         <h3>
           Receipt #{String(selectedOrder.orderNumber).padStart(3, "0")}
         </h3>

         <p>Customer: {selectedOrder.customerName}</p>

         <div className="receipt-line"></div>

         {selectedOrder.items.map((item, index) => (
          <div key={index} className="receipt-row">
            <span>{item.name} x {item.quantity}</span>
            <span>{item.price * item.quantity}    THB</span>

          </div>
         ))}

         <div className="receipt-line"></div>

         <div className="receipt-total">
          <span>Total</span>

          <strong>{selectedOrder.total} THB</strong>
         </div>

         <button className="action-btn" onClick={() => setSelectedOrder(null)}>
            Close
         </button>

         <button className="action-btn" onClick={() => window.print()}>
          Print Receipt
         </button>
      </div>
      </div>
 
  )}
  </div>
  </div>
 
  ); 
}
  

    

export default App;
