import RegisterForm from "../../forms/RegisterForm"

const RegisterArea = () => {
   return (
      <div className="tg-login-area pt-130 pb-130">
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-xl-6 col-lg-8 col-md-10">
                  <div className="tg-login-wrapper">
                     <div className="tg-login-top text-center mb-30">
                        <h2>Hemen Kayıt Olun</h2>
                        <p>Ücretsiz hesap oluşturarak AtaBilet avantajlarından yararlanın.</p>
                     </div>
                     <div className="tg-login-form">
                        <div className="tg-tour-about-review-form">
                           <RegisterForm />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default RegisterArea
