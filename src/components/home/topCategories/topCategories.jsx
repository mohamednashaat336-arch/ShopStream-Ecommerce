import { FaArrowRight } from "react-icons/fa";
import './topCategories.css'
import topC_computing from '../../../assets/topC_computing.png'
import topC_wearables from '../../../assets/topC_wearables.png'
import topC_audio from '../../../assets/topC_audio.png'
import topC_home_theater from '../../../assets/topC_home_theater.png'
import { Link } from 'react-router-dom'


export function TopCategories(){
    return(
        <>
            <div className="topC-main">
                <div className="topC-title">
                    <h3>Top Categories</h3>
                
                    <div className="topC-text">
                        <p>Curated gear for every lifestyle.</p>
                        <Link to="/categories">See All <FaArrowRight /> </Link>
                    </div>
                </div>

                <div className="categories-grid">
                    <div className="categories-item computing">
                        <img src={topC_computing} alt="" />
                        <div className="categories-label">
                            <h3>Computing</h3>
                            <p>Work and play without limits.</p>
                        </div>
                    </div>
                    <div className="categories-item wearables">
                        <img src={topC_wearables} alt="" />
                        <div className="categories-label">
                            <p>Wearables</p>
                        </div>
                    </div>
                    <div className="categories-item audio">
                        <img src={topC_audio} alt="" />
                         <div className="categories-label">
                            <p>Audio</p>
                        </div>
                    </div>
                    <div className="categories-item home-theater">
                        <img src={topC_home_theater} alt="" />
                         <div className="categories-label">
                            <p>Home Theater</p>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}
