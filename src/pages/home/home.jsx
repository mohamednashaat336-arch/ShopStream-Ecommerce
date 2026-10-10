
import { Hero } from '../../components/home/hero/hero'
import { TopCategories } from '../../components/home/topCategories/topCategories'
import { FeaturedProducts } from '../../components/home/featuredProducts/featuredProducts'
import { StayAhead } from '../../components/home/stayAhead/stayAhead'
import { Navbar } from '../../components/navbar/navbar'

export function Home(){
    return(
        <>
            <Navbar />
            <Hero />
            <TopCategories />
            <FeaturedProducts />
            <StayAhead />
        
        </>
    )
}