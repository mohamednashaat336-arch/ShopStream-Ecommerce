import { TopCategories } from "../../components/home/topCategories/topCategories";
import { Navbar } from "../../components/navbar/navbar";
import { CategoryDirectory } from "../../components/home/topCategories/categoryDirectory";

export function Categories(){
    return(
        <>
            <Navbar />
            <TopCategories />
            <CategoryDirectory />
        </>
    )
}
