import {Resend} from 'resend';
import {createInquiryHandler} from '../lib/inquiry-handler.mjs';

const key=process.env.RESEND_API_KEY;
const resend=key?new Resend(key):null;
export default createInquiryHandler({
  enabled:process.env.INQUIRY_EMAIL_ENABLED==='true'&&Boolean(key)&&process.env.VERCEL_ENV!=='preview',
  from:`Digits Studio <hello@${process.env.RESEND_EMAIL_DOMAIN||'digitsstudio.online'}>`,
  to:'ahmad.alawieh77@gmail.com',
  sendEmail:resend?(payload,options)=>resend.emails.send(payload,options):undefined,
  allowLocal:process.env.NODE_ENV!=='production',
});
