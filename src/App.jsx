import "./App.css";
import MenuCard from "./MenuCard";

import americano from "./assets/americano.jpg";
import latte from "./assets/latte.jpg";
import cappuccino from "./assets/cappuccino.jpg"; 
import { useEffect, useState } from "react";


function App() {
   const [cart, setCart] = useState([]);
   
   const [customerName, setCustomerName] = useState("");
   const [orders, setOrders] = useState([]);
   const [orderNumber, setOrderNumber] = useState(1);
   const [searchText, setSeachText] = useState("");

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
     if (customerName.trim() === "") {
      alert("Please enter customer name")
      return;
    }
    const newOrder = {
      id: Date.now(),
      customerName: customerName,
      items: cart,
      total: totalPrice,
      orderNumber: orderNumber,
    };

    setOrders([...orders, newOrder]);

    setCart([]);

     setCustomerName("");

     setOrderNumber(orderNumber + 1);

    alert("Order submitted ☕");

    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }
  };

  const totalPrice = cart.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  const totalItems = cart.reduce((sum, item) => {
    return sum + item.quantity;
  }, 0);

  const filteredOrders = orders.filter((order) => 
     order.customerName
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

  

  return (
     <div>
      <h1>Tui Cafe ☕</h1>

    <div className="floating-cart">
       🛒 {totalItems}

    </div>
   

   

    <div className="customer-box">
        
       <input
          type="text"
          placeholder="Enter your name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
       />
   
         <h3>Hello, {customerName}</h3>
    </div>
    <div className="cart-box">

    <h2>Cart: {cart.length === 0 && (
      <p>Your cart is empty ☕ </p>
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

    <input 
          type="text"
          placeholder="Search customer..."
          value={searchText}
          onChange={(e) => setSeachText(e.target.value)}
    />

    <div className="stats-box">
        <h3>Total Orders: {totalOrders}</h3> 
        <h3>Total Revenue: {totalRevenue}</h3>
        <h3>Total Cups Sold: {totalCupsSold}</h3>
    </div>

    <h2>Order History</h2>

    {orders.length === 0 ? (
      <p>No orders yet </p>
    ) : (
        filteredOrders.map((order) => (
        <div key={order.id} className="order-card">
          <h3>Order #{order.orderNumber}</h3>
          <h3>Customer: {order.customerName}</h3>
          <p>Total: {order.total} Baht</p>

          <button onClick={() => deleteOrder(order.id)}>
            Delete Order
            </button>

          {order.items.map((item) => (
            <p key={item.id}>
              {item.name} x {item.quantity}
            </p>
))}            
        </div>
      ))
   )}

      <h2>Total: {totalPrice} THB</h2>

      <button onClick={clearCart}>  🗑  Clear Cart</button>

      <button onClick={submitOrder}> Submit Order </button>
  </div>

    
        

      <hr />

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
   
  );
}

export default App;
