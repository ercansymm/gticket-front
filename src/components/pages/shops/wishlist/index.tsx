import FooterOne from "../../../../layouts/footers/FooterOne"
import HeaderOne from "../../../../layouts/headers/HeaderOne"
import TrustBar from "../../../homes/home-one/TrustBar"
import BreadCrumb from "../../../common/BreadCrumb"
import WishlistArea from "./WishlistArea"

const Wishlist = () => {
  return (
    <>
      <TrustBar />
      <HeaderOne />
      <main>
        <BreadCrumb title="Favoriler" sub_title="Favoriler" />
        <WishlistArea />
      </main>
      <FooterOne />
    </>
  )
}

export default Wishlist
