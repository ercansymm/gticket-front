import { toast } from 'react-toastify';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import emailjs from '@emailjs/browser';
import { useRef } from 'react';

const schema = z.object({
   user_name: z.string().min(1, "Name is required"),
   user_email: z.string().min(1, "Email is required").email("Invalid email"),
   web: z.string().min(1, "Website is required"),
   message: z.string().min(1, "Message is required"),
});

type FormData = z.infer<typeof schema>;

const ContactForm = () => {

   const { register, handleSubmit, reset, formState: { errors }, } = useForm<FormData>({ resolver: zodResolver(schema), });

   const form = useRef<HTMLFormElement>(null);

   const sendEmail = () => {
      if (form.current) {
         emailjs.sendForm('themedox', 'template_vvhaqp9', form.current, 'QOBCxT0bzNKEs-CwW')
            .then(() => {
               toast.success('Message sent successfully', { position: 'top-center' });
               reset();
            })
            .catch(() => {
               toast.error('Failed to send message. Please try again.', { position: 'top-center' });
            });
      } else {
         toast.error('Form reference is null.', { position: 'top-center' });
      }
   };

   return (
      <form ref={form} onSubmit={handleSubmit(sendEmail)} id="contact-form">
         <div className="row">
            <div className="col-lg-6 mb-25">
               <input className="input" type="text" {...register("user_name")} placeholder="Name" />
               <p className="form_error">{errors.user_name?.message}</p>
            </div>
            <div className="col-lg-6 mb-25">
               <input className="input" type="email" {...register("user_email")} placeholder="E-mail" />
               <p className="form_error">{errors.user_email?.message}</p>
            </div>
            <div className="col-lg-12 mb-25">
               <input className="input" type="text" {...register("web")} placeholder="Website" />
               <p className="form_error">{errors.web?.message}</p>
            </div>
            <div className="col-lg-12">
               <textarea className="textarea mb-5" {...register("message")} placeholder="Comments"></textarea>
               <p className="form_error">{errors.message?.message}</p>
               <div className="review-checkbox d-flex align-items-center mb-25">
                  <input name="checkbox" className="tg-checkbox" type="checkbox" id="australia" />
                  <label htmlFor="australia" className="tg-label">
                     Save my name, email, and website in this browser for the next time I comment.
                  </label>
               </div>
               <button type="submit" className="tg-btn" name="message">Send Message</button>
               <p className="ajax-response mb-0 pt-10"></p>
            </div>
         </div>
      </form>
   )
}

export default ContactForm
