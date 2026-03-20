import Link from "next/link";

const RegisterForm = () => {

   return (
      <form onSubmit={(e) => e.preventDefault()}>
         <div className="row">
            <div className="col-lg-12 mb-25">
               <input className="input" type="text" placeholder="Kullanıcı adınızı girin" />
            </div>
            <div className="col-lg-12 mb-25">
               <input className="input" type="email" placeholder="E-posta adresinizi girin" />
            </div>
            <div className="col-lg-12 mb-25">
               <input className="input" type="text" placeholder="Şifre" />
            </div>
            <div className="col-lg-12 mb-25">
               <input className="input" type="text" placeholder="Şifre Tekrar" />
            </div>
            <div className="col-lg-12">
               <div className="d-flex align-items-center justify-content-between">
                  <div className="review-checkbox d-flex align-items-center mb-25">
                     <input className="tg-checkbox" type="checkbox" id="australia" />
                     <label htmlFor="australia" className="tg-label">Beni hatırla</label>
                  </div>
                  <div className="tg-login-navigate mb-25">
                     <Link href="/login">Giriş Yap</Link>
                  </div>
               </div>
               <button type="submit" className="tg-btn w-100">Kayıt Ol</button>
            </div>
         </div>
      </form>
   )
}

export default RegisterForm
