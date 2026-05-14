function MenuCard(props) {
  return (
    <div className="card">
     
     <img
       src={props.image}
       alt={props.name}
       className="coffee-img"

       />

       <h2>{props.name}</h2>

       <p>{props.price} THB</p>

       <button onClick={props.addToCart}>Add to Cart</button>
    </div>
  );
}

export default MenuCard;