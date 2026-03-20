import { toast } from 'react-toastify';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import emailjs from '@emailjs/browser';
import { useRef } from 'react';

const schema = z.object({
   user_name: z.string().min(1, "Ad gereklidir"),
   user_email: z.string().min(1, "E-posta gereklidir").email("Geçersiz e-posta"),
   web: z.string().min(1, "Web sitesi gereklidir"),
   message: z.string().min(1, "Mesaj gereklidir"),
});

type FormData = z.infer<typeof schema>;

const ContactForm = () => {

   const { register, handleSubmit, reset, formState: { errors }, } = useForm<FormData>({ resolver: zodResolver(schema), });

   const form = useRef<HTMLFormElement>(null);

   const sendEmail = () => {
      if (form.current) {
         emailjs.sendForm('themedox', 'template_vvhaqp9', form.current, 'QOBCxT0bzNKEs-CwW')
            .then(() => {
               toast.success('Mesaj başarıyla gönderildi', { position: 'top-center' });
               reset();
            })
            .catch(() => {
               toast.error('Mesaj gönderilemedi. Lütfen tekrar deneyin.', { position: 'top-center' });
            });
      } else {
         toast.error('Form referansı bulunamadı.', { position: 'top-center' });
      }
   };

   return (
      <form ref={form} onSubmit={handleSubmit(sendEmail)} id="contact-form">
         <div className="row">
            <div className="col-lg-6 mb-25">
               <input className="input" type="text" {...register("user_name")} placeholder="Ad Soyad" />
               <p className="form_error">{errors.user_name?.message}</p>
            </div>
            <div className="col-lg-6 mb-25">
               <input className="input" type="email" {...register("user_email")} placeholder="E-posta" />
               <p className="form_error">{errors.user_email?.message}</p>
            </div>
            <div className="col-lg-12 mb-25">
               <input className="input" type="text" {...register("web")} placeholder="Web Sitesi" />
               <p className="form_error">{errors.web?.message}</p>
            </div>
            <div className="col-lg-12">
               <textarea className="textarea mb-5" {...register("message")} placeholder="Mesajınız"></textarea>
               <p className="form_error">{errors.message?.message}</p>
               <div className="review-checkbox d-flex align-items-center mb-25">
                  <input name="checkbox" className="tg-checkbox" type="checkbox" id="australia" />
                  <label htmlFor="australia" className="tg-label">
                     Bir dahaki sefere yorum yapmak için adımı, e-postamı ve web sitemi bu tarayıcıya kaydet.
                  </label>
               </div>
               <button type="submit" className="tg-btn" name="message">Mesaj Gönder</button>
               <p className="ajax-response mb-0 pt-10"></p>
            </div>
         </div>
      </form>
   )
}

export default ContactForm
