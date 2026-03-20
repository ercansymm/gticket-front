import FooterOne from "../../../layouts/footers/FooterOne"
import HeaderOne from "../../../layouts/headers/HeaderOne"
import TrustBar from "../../homes/home-one/TrustBar"
import BreadCrumb from "../../common/BreadCrumb"
import AboutArea from "./AboutArea"
import Choose from "./Choose"
import Cta from "./Cta"

const About = () => {
   return (
      <>
         <TrustBar />
         <HeaderOne />
         <main>
            <BreadCrumb title="Hakkımızda" sub_title="Hakkımızda" />
            <AboutArea />
            <Choose />
            <Cta />
         </main>
         <FooterOne />
      </>
   )
}

export default About
