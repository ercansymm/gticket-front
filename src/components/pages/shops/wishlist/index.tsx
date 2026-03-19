import FooterSix from "../../../../layouts/footers/FooterSix"
import HeaderThree from "../../../../layouts/headers/HeaderThree"
import BreadCrumb from "../../../common/BreadCrumb"
import WishlistArea from "./WishlistArea"

const Wishlist = () => {
  return (
    <>
      <HeaderThree />
      <main>
        <BreadCrumb title="Wishlist Page" sub_title="Wishlist" />
        <WishlistArea />
      </main>
      <FooterSix />
    </>
  )
}

export default Wishlist
