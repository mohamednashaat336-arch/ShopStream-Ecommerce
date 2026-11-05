import pic1_home from '../../../assets/pic1_home.png'
import './hero.css'
import { Link } from 'react-router-dom'

export function Hero(){
    return(
        <>
            <div className='main'>
                <div className='hero-text'>
                    <label>NEW SEASON ARRIVAL</label>
                    <h1>Experience the Future of <span className='hero-h1'>Innovation.</span></h1>
                    <p>Explore our curated selection of premium electronics designed to elevate your daily stream of life. Precision engineering meets minimalist design.</p>
                    <div className='-btn'>
                        <Link to="/products" className='btn1'>Shop Electronics</Link>
                        <Link to="/categories" className='btn2'>View Collections</Link>
                    </div>
                    

                </div>
                <div className='hero-img'>
                    <img src={pic1_home} alt="" />
                </div>
            </div>

        
        </>
    )
}
