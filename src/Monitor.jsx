import { useEffect, useRef, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { db } from "./firebase";
import "./App.css";

function Monitor() {
  const [orders, setOrders] = useState([]);
  const [soundReady, setSoundReady] = useState(false)
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const oldOrderCount = useRef(0);
  const audioRef = useRef(null)
  const playAlert = async () => {
    try {
      const audio = new Audio("/sounds/alarm.wav");

      audioRef.current = audio;
      audio.loop = true;
      audio.volume = 1;
      audio.playsInline = true
      audio.preload = "auto";

      await audio.play();

      setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, 90000 );

    } catch (error) {
      console.log("Sound blocked:", error);
    }
  };

  const updateStatus = async (id, currentStatus) => {
    let newStatus = "Pending";

    if (currentStatus === "Pending") {
      newStatus = "Preparing";

   } else if (currentStatus === "Preparing") {
     newStatus = "Done";
   } else if (currentStatus === "Preparing") {
    newStatus = "Pending";
   }

   try {
      await update(ref(db,`orders/${id}`), {
     status : newStatus,
   });

     console.log("Status Updeted:", newStatus);
   } catch (error) {
    console.error(error);
   }
};

  useEffect(() => {
    const ordersRef = ref(db, "orders");

    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const firebaseOrders = Object.entries(data)
         .map(([id, order]) => ({
          id,
          ...order,
          items: order.cart || [],
         }))
         .sort((a, b) => b.createdAt - a.createdAt);

      if (soundReady && oldOrderCount.current !== 0 && firebaseOrders.length > oldOrderCount.current) {
         setNewOrderAlert(firebaseOrders[0]);

        setTimeout(() => {
          setNewOrderAlert(null);
        }, 6000);

        playAlert();
     }
         
        oldOrderCount.current = firebaseOrders.length;
         setOrders(firebaseOrders);
      } else {
        setOrders([]);
      }
    });

    return () => unsubscribe();
  }, [soundReady]);

  return (
    <div className="app-wrapper">

      {newOrderAlert && (
        <div className="new-order-popup">
          <h3>🔔New Order!</h3>
          <p>Cusomer: {newOrderAlert.customerName}</p>
          <p>Total: {newOrderAlert.total}     THB</p>
        </div>
      )}
       <h1>☕ Tui Cafe Monitor</h1>

  <button 
  className={soundReady ? "sound-btn active-sound" : "sound-btn"}
      onClick={async () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
    }
    if (!soundReady) {
      setSoundReady(true);

      const testAudio = new Audio("/sounds/alarm.wav");
      testAudio.volume = 1;
      testAudio.playsInline = true;

      try {
        await testAudio.play();

        setTimeout(() => {
          testAudio.pause();
          testAudio.currentTime = 0;
        }, 500);
      } catch (error) {
        console.log("Mobile sound blocked:", error);
      }
    } else {
       setSoundReady(false);
    }
}}
  >
    {soundReady ? "🔊Sound ON" : "🔔 Enable Sound"}
  </button>

  

       {orders.length === 0 ? (
         <h2>No orders yet</h2>
       ) : (
        orders.map((order) => (
          <div key={order.id} className="order-card">
            <h2>Order #{order.orderNumber ? String(order.orderNumber).padStart(3, "0") : "No Number"}</h2>
            <h3>Customer: {order.customerName}</h3>
            <p>Total: {order.total} THB</p>

            {order.items.map((item, index) => (
              <p key={index}>
                  {item.name} x {item.quantity} - {item.type} / {item.sweetness}
              </p>
            ))}

          
          </div>
        ))
       )}
    </div>
  );
}

export default Monitor;