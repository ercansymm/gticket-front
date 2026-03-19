
import Link from "next/link";

const LoginForm = () => {

   return (
      <form onSubmit={(e) => e.preventDefault()}>
         <div className="row">
            <div className="col-lg-12 mb-25">
               <input className="input" type="text" placeholder="E-mail" />
            </div>
            <div className="col-lg-12 mb-25">
               <input className="input" type="password" placeholder="Password" />
            </div>
            <div className="col-lg-12">
               <div className="d-flex align-items-center justify-content-between">
                  <div className="review-checkbox d-flex align-items-center mb-25">
                     <input className="tg-checkbox" type="checkbox" id="australia" />
                     <label htmlFor="australia" className="tg-label">Remember me</label>
                  </div>
                  <div className="tg-login-navigate mb-25">
                     <Link href="/register">Register Now</Link>
                  </div>
               </div>
               <button type="submit" className="tg-btn w-100">Sign In</button>
            </div>
         </div>
      </form>
   )
}

export default LoginForm
