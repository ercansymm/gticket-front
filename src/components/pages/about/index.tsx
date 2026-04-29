import FooterOne from "../../../layouts/footers/FooterOne";
import HeaderOne from "../../../layouts/headers/HeaderOne";
import AboutArea from "./AboutArea";
import Choose from "./Choose";
import Cta from "./Cta";

const About = () => {
   return (
      <>
         <HeaderOne />
         <main>
            <AboutArea />
            <Choose />
            <Cta />
         </main>
         <FooterOne />
      </>
   );
};

export default About;
