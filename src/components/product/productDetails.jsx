import { useParams } from 'react-router-dom';
// import './ProductsDetails.css';
import { useEffect, useState } from 'react';


export function ProductsDetails (){
    const {id} = useParams();
    const [product,setProduct] = useState(null);
    const [count, setCount] = useState(1);
    useEffect(()=>{
        fetch(`https://dummyjson.com/products/${id}`)
        .then(res => res.json())
        .then(data => setProduct(data));

    },[id])

    if (!product){
        return <h2>Loading...</h2>
    }

    function decrement(){
        if(count >1){
            setCount(count-1)
        }
    }
    
    function back(){
        history.back()
    }
    return(
        <>
            <div>
                
                <div className='contener'>
                    <div className='main'>
                        <button onClick={back}>back</button>
                    </div>
                    <img src={product.thumbnail} alt={product.description} />
                    <h2>{product.title}</h2>
                    <p>{product.description}</p>
                    <p>Price : {product.price} $</p>
                    <input type="number" value={count} readOnly /> <br />
                    <span className='btn_'>
                        <button onClick={()=>setCount(count+1)}>+</button>
                        <button onClick={decrement}>-</button> <br />
                     </span>
                    <button >Add To Cart</button>
                </div>
            </div>
        </>
    )
}