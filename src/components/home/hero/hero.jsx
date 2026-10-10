import pic1_home from '../../../assets/pic1_home.png'
import './hero.css'

export function Hero(){
    return(
        <>
            <div className='main'>
                <div className='hero-text'>
                    <label>NEW SEASON ARRIVAL</label>
                    <h1>Experience the Future of <span className='hero-h1'>Innovation.</span></h1>
                    <p>Explore our curated selection of premium electronics designed to elevate your daily stream of life. Precision engineering meets minimalist design.</p>
                    <div className='-btn'>
                        <button className='btn1'>Shop Electronics</button>
                        <button className='btn2'>View Collections</button>
                    </div>
                    

                </div>
                <div className='hero-img'>
                    <img src={pic1_home} alt="" />
                </div>
            </div>

        
        </>
    )
}