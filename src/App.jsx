import "./App.css";
import MenuCard from "./MenuCard";

import americano from "./assets/americano.jpg";
import latte from "./assets/latte.jpg";
import cappuccino from "./assets/cappuccino.jpg"; 

import { useState } from "react";

function App() {
   const [cart, setCart] = useState([]);
   const [customerName, setCustomerName] = useState("");

  const menu = [
    {
      id: 1,
      name: "Americano",
      price: 50,
      image: americano,
    },

     {
      id: 2,
      name: "Latte",
      price: 60,
      image: latte,
    },

     {
      id: 3,
      name: "Cappuccino",
      price: 70,
      image: cappuccino,
    },
  ];

  const addToCart = (item) => {
    
    const existingItem = cart.find (
      (cartItem) => cartItem.id === item.id
    );

    if (existingItem) {

      const updateCart = cart.map((cartItem) => 
       cartItem.id === item.id 
    ? {
      ...cartItem,
      quantity: cartItem.quantity + 1,
    }
      : cartItem
    );

      setCart(updateCart);

} else {
    setCart([
      ...cart,
      { ...item, quantity: 1,},
    ]);
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

  const totalPrice = cart.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  const totalItems = cart.reduce((sum, item) => {
    return sum + item.quantity;
  }, 0);

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
      <h2>Cart:{cart.length}</h2>

      {cart.map((item, index) => (
         <div key={item.id} className="cart-item">

          <p>
            {item.name} x {item.quantity}
          </p>

          <p>
            {item.price * item.quantity} THB
          </p>

          <div className="qty-button">
            <button onClick={() => decreaseQuantity(item.id)}>
              -
              </button>

            <button onClick={() => increaseQuantity(item.id)}>
              +
              </button>
          </div>
          </div>
     ))}

      <hr />

      {menu.map((item) => (
        <MenuCard 
          key={item.id}
          name={item.name}
          price={item.price}
          image={item.image}
          addToCart={() => addToCart(item)}
        />
      ))}
     </div>
    </div>
  
  );
}

export default App;
