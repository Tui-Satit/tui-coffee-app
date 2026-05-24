import { useState} from "react";

function MenuCard(props) {
  const [drinkType, setDrinkType] = useState("Cold");
  const [sweetness, setSweetness] = useState("Normal");

  return (
    <div className="card">
     
     <img
       src={props.image}
       alt={props.name}
       className="coffee-img"

       />

       <h2>{props.name}</h2>

       <div className="type-group">
         <button 
           className={`option-btn type-btn ${
             drinkType === "Hot" ? "active-hot" : ""
            }`}
            onClick={() => setDrinkType("Hot")}
         >
            ☕ Hot
         </button>

         <button 
           className={`option-btn type-btn ${
             drinkType === "Cold" ? "active-cold" : ""
            }`}
             onClick={() => setDrinkType("Cold")}
         >
           🧊 Cold
         </button>
       </div>

        <div className="sweetness-group">
           <button
          className={`option-btn sweet-btn ${
            sweetness === "Normal" ? "active-sweet" : ""
          }`}

          onClick={() => setSweetness("Normal")}>
            Normal
          </button>   

           <button
            className={`option-btn sweet-btn ${
              sweetness === "Less Sweet" ? "active-sweet" : ""
            }`}
            onClick={() => setSweetness("Less Sweet")}>
            Less Sweet
          </button>

           <button
            className={`option-btn sweet-btn ${
              sweetness === "No Sugar" ? "active-sweet" : ""
            }`}
            onClick={() => setSweetness("No Sugar")}>
            No Sugar
          </button>
        </div>

          
 

        <p>Selected: {drinkType}</p>
        <p>Sweetness: {sweetness}</p>

       <p>{props.price} THB</p>

       <button
       className="add-cart-btn" 
       onClick={() =>
        props.addToCart ({
          id: props.id,
          name: props.name,
          price: props.price,
          image: props.image,
          type: drinkType,
          sweetness: sweetness,
        })
        }>Add to Cart</button>
    </div>
  );
}

export default MenuCard;