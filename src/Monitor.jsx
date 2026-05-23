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
  
  const enableSound = async () => {
    setSoundReady(true);

    if (!audioRef.current) {
      audioRef.current = new Audio("/sounds/notification2.wav");
      audioRef.current.loop = true;
      audioRef.current.volume = 1;
      audioRef.current.playsInline = true;
      audioRef.current.preload = "auto";
    }

    try {
      await audioRef.current.play();

      setTimeout(() => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }, 1000);
     
    } catch (error) {
      console.log("Enable sound failed", error);
    }
  };

  const playAlert = async () => {
  try {
    if (!audioRef.current) {
      audioRef.current = new Audio("/sounds/notification2.wav");
      audioRef.current.loop = true;
      audioRef.current.volume = 1;
      audioRef.current.playsInline = true;
      audioRef.current.preload = "auto";
    }

    audioRef.current.currentTime = 0;
    await audioRef.current.play();

    setTimeout(() => {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }, 90000);
  } catch (error) {
    console.log("Sound blocked:", error);
  }
};
const stopSound = () => {
  setSoundReady(false);

  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }
};

 

  useEffect(() => {
    const ordersRef = ref(db, "orders");

    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const firebaseOrders = Object.entries(data)
         .map(([id, order]) => ({
          id,
          ...order,
          items: order.cart || [],
         }))
         .sort((a, b) => b.createdAt - a.createdAt);

         setOrders(firebaseOrders);

         if (soundReady && firebaseOrders.length > oldOrderCount.current) {
          playAlert();
          setNewOrderAlert("New order coming!");
         }

         oldOrderCount.current = firebaseOrders.length;
      } 
    });
  }, [soundReady]);

  const updateStatus = async (id, currentStatus) => {
    let newStatus = "Pending";

    if (currentStatus === "Pending") {
      newStatus = "Preparing";
    } else if (currentStatus === "Preparing") {
      newStatus = "Completed";
    }

    await update(ref(db, `orders/${id}`), {
      status: newStatus,
    });
  };

  const activeOrders = orders.filter(
    (order) => order.status !== "Completed"
  );

  const historyOrders = orders.filter(
    (order) => order.status === "Completed"
  );

  return (
    <div className="monitor-page">
      <h1>☕ Tui Cafe Monitor</h1>

  <button
    className="sound-btn"
    onClick={soundReady ? stopSound : enableSound}
  >
     {soundReady ? "🔇 Close Sound" : "🔊 Open Sound"}  
  </button>

      <h2>Active Orders</h2>

      <div className="orders-grid">
        {activeOrders.map((order) => (
          <div className="order-card" key={order.id}>
            <h3>#{order.orderNumber}</h3>

            <p>
              <strong>{order.customerName}</strong>
            </p>

            {order.items.map((item, index) => (
              <p key={index}>
                  {item.quantity}x {item.name}
              </p>
            ))}

             <p>Status: {order.status || "Pending"}</p>

             <button
              onClick={() =>
                 updateStatus(order.id, order.status || "Pending")
              }
              >
                Next Step
             </button>
          </div>
        )) }
     </div>

       <h2 className="history-title">📜 Order History</h2>

       <div className="history-grid">
        {historyOrders.map((order) => (
          <div className="history-card" key={order.id}>
            <h3>#{order.orderNumber}</h3>

          <p>
            <strong>{order.customerName}</strong>
          </p>

          {order.items.map((item, index) => (
            <p key={index}>
                {item.quantity}x {item.name}
            </p>
          ))}

          <p className="completed-text">
               ✅ Completed
          </p>
        </div>
      ))}
   </div>
    </div>
  );
}

  

export default Monitor;