const ReviewForm = () => {

   return (
      <form onSubmit={(e) => e.preventDefault()}>
         <div className="row">
            <div className="col-lg-6 mb-15">
               <input className="input" type="text" placeholder="Adınız" />
            </div>
            <div className="col-lg-6 mb-15">
               <input className="input" type="email" placeholder="E-posta Adresi" />
            </div>
            <div className="col-lg-12">
               <textarea className="textarea  mb-5" placeholder="Mesajınızı yazın"></textarea>
               <div className="review-checkbox d-flex align-items-center mb-25">
                  <input className="tg-checkbox" type="checkbox" id="australia" />
                  <label htmlFor="australia" className="tg-label">Bir dahaki sefere yorum yapmak için adımı, e-postamı ve web sitemi bu tarayıcıya kaydet.</label>
               </div>
               <button type="submit" className="tg-btn tg-btn-switch-animation">Değerlendirme Gönder</button>
            </div>
         </div>
      </form>
   )
}

export default ReviewForm
