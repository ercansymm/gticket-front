import FooterOne from "../../layouts/footers/FooterOne"
import HeaderOne from "../../layouts/headers/HeaderOne"
import TrustBar from "../homes/home-one/TrustBar"
import BreadCrumb from "../common/BreadCrumb"
import ContactArea from "./ContactArea"

const Contact = () => {
   return (
      <>
         <TrustBar />
         <HeaderOne />
         <main>
            <BreadCrumb title="İletişim" sub_title="İletişim" />
            <ContactArea />
         </main>
         <FooterOne />
      </>
   )
}

export default Contact
