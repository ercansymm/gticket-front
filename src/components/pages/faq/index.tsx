import FaqArea from "./FaqArea"
import FooterOne from "../../../layouts/footers/FooterOne"
import HeaderOne from "../../../layouts/headers/HeaderOne"
import TrustBar from "../../homes/home-one/TrustBar"
import BreadCrumb from "../../common/BreadCrumb"

const Faq = () => {
   return (
      <>
         <TrustBar />
         <HeaderOne />
         <main>
            <BreadCrumb title="Sıkça Sorulan Sorular" sub_title="SSS" />
            <FaqArea />
         </main>
         <FooterOne />
      </>
   )
}

export default Faq
