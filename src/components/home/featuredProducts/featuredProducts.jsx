import { FaCartArrowDown } from 'react-icons/fa'
import './featuredProducts.css'
import featured_products_audio from '../../../assets/featured_products_audio.png'
import featured_products_accessories from '../../../assets/featured_products_accessories.png'
import featured_products_drones from '../../../assets/featured_products_drones.png'
import featured_products_gaming from '../../../assets/featured_products_gaming.png'
import { localProducts } from '../../../services/products'
import { useCart } from '../../../hooks/useCart'
export function FeaturedProducts(){
    const { addToCart } = useCart()
    return(
        <>
            <div className="featured-main">
                <div className="featured-title">
                    <h3>Featured Products</h3>
                    <div className="featured-text">
                        <p>The latest and greatest in tech innovation.</p>
                        <span>
                            <nav aria-label="Page navigation example">
                                <ul className="pagination">
                                    <li className="page-item">
                                    <a className="page-link" href="#" aria-label="Previous">
                                        <span aria-hidden="true">&laquo;</span>
                                    </a>
                                    </li>
                                    <li className="page-item">
                                    <a className="page-link" href="#" aria-label="Next">
                                        <span aria-hidden="true">&raquo;</span>
                                    </a>
                                    </li>
                                </ul>
                            </nav>
                        </span>
                    </div>
                </div>
                <div className='row container'>
                    <div className='col-12 col-md-4 col-lg-3 card m-2'>
                        <div className='card-item'>
                            <img src={featured_products_audio} alt="" />
                            <div className='card-title pt-4'>
                                <p className='card-title-p1'>AUDIO</p>
                                <p className='card-title-p2'>StreamPods Pro Gen 2</p>
                                <span className='badge- '>BEST SELLER</span>
                                <span className='card-price'>
                                    <p>$199.00</p> 
                                    <button type="button" onClick={() => addToCart(localProducts.find((product) => product.id === 2001))} aria-label="Add StreamPods Pro Gen 2 to cart"><FaCartArrowDown/> </button>
                                </span>

                            </div>
                            
                        </div>
                    </div>
                    <div className='col-12 col-md-4 col-lg-3 card m-2'>
                        <div className='card-item'>
                            <img src={featured_products_accessories} alt="" />
                            <div className='card-title pt-4'>
                                <p className='card-title-p1'>ACCESSORIES</p>
                                <p className='card-title-p2'>StreamKey Ultra Slim</p>
                                {/* <span className='badge '>BEST SELLER</span> */}
                                <span className='card-price'>
                                    <p>$129.00</p> 
                                    <button type="button" onClick={() => addToCart(localProducts.find((product) => product.id === 2002))} aria-label="Add StreamKey Ultra Slim to cart"><FaCartArrowDown/> </button>
                                </span>

                            </div>
                            
                        </div>
                    </div>
                    <div className='col-12 col-md-4 col-lg-3 card m-2'>
                        <div className='card-item'>
                            <img src={featured_products_drones} alt="" />
                            <div className='card-title pt-4'>
                                <p className='card-title-p1'>DRONES</p>
                                <p className='card-title-p2'>AeroStream V3</p>
                                <span className='badge-  '>NEW</span>
                                <span className='card-price'>
                                    <p>$849.00</p> 
                                    <button type="button" onClick={() => addToCart(localProducts.find((product) => product.id === 2003))} aria-label="Add AeroStream V3 to cart"><FaCartArrowDown/> </button>
                                </span>

                            </div>
                            
                        </div>
                    </div>
                    <div className='col-12 col-md-4 col-lg-3 card m-2'>
                        <div className='card-item'>
                            <img src={featured_products_gaming} alt="" />
                            <div className='card-title pt-4'>
                                <p className='card-title-p1'>GAMING</p>
                                <p className='card-title-p2'>Nexus Glide Pro</p>
                                
                                <span className='card-price'>
                                    <p>$89.00</p> 
                                    <button type="button" onClick={() => addToCart(localProducts.find((product) => product.id === 2004))} aria-label="Add Nexus Glide Pro to cart"><FaCartArrowDown/> </button>
                                </span>

                            </div>
                            
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}
