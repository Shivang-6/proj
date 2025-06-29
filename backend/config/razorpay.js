import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: 'rzp_test_zpvHrBMDaj817K',
  key_secret: process.env.RAZORPAY_SECRET_KEY || 'your_razorpay_secret_key_here'
});

export default razorpay; 