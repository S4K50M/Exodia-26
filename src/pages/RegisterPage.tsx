import React, { useEffect, useState } from 'react';

import bottomLeft from '../assets/register/left-bottom.png';
import bottomRight from '../assets/register/right-bottom.png';
import background from '../assets/register/background.png';
import leftSide from '../assets/register/side-left.png';
import rightSide from '../assets/register/side-right.png';

// Ensure your supabase client is correctly configured in this file
import supabase from '../utils/supabase';

export function RegisterPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    institute: '',
    contingentSize: '',
    amountPaid: '',
    transactionId: ''
  });
  const [file, setFile] = useState<File | null>(null);
  
  // Loading and Notification State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' }); // type: 'success' | 'error'

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Handle generic input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg({ text: '', type: '' });

    try {
      if (!file) {
        throw new Error("Please upload a screenshot of your payment.");
      }

      // 1. Upload the image to Supabase Storage bucket named 'payment_proofs'
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment_proofs')
        .upload(fileName, file);

      if (uploadError) throw new Error("Image upload failed: " + uploadError.message);

      // Get the public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('payment_proofs')
        .getPublicUrl(fileName);

      // 2. Insert form data and image URL into 'registrations' table
      const { error: dbError } = await supabase
        .from('registrations')
        .insert([
          {
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            institute_name: formData.institute,
            contingent_size: parseInt(formData.contingentSize),
            total_amount: parseInt(formData.amountPaid),
            transaction_id: formData.transactionId,
            proof_url: publicUrl // Link to the uploaded image
          }
        ]);

      if (dbError) throw new Error("Database error: " + dbError.message);

      // 3. Success! Clear the form
      setStatusMsg({ text: 'Registration successful! We will verify your payment.', type: 'success' });
      setFormData({ fullName: '', email: '', phone: '', institute: '', contingentSize: '', amountPaid: '', transactionId: '' });
      setFile(null);
      // Reset the file input visually
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      setStatusMsg({ text: error.message || 'Something went wrong.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="relative w-screen h-screen bg-transparent bg-cover bg-center bg-no-repeat overflow-hidden font-sans text-white"
      style={{ backgroundImage: `url(${background})` }}
    >
      
      {/* --- BACKGROUND ANIMATIONS --- */}
      <div className={`absolute top-0 left-0 w-[10%] h-[20%] bg-transparent bg-no-repeat transition-transform duration-2000 ease-out delay-0 ${isLoaded ? 'translate-x-0' : '-translate-x-[100vw]'} bg-[length:100%_300%] bg-[position:0%_0%]`} style={{ backgroundImage: `url(${leftSide})` }} />
      <div className={`absolute top-[20%] left-0 w-[10%] h-[20%] bg-transparent bg-no-repeat transition-transform duration-2000 ease-out delay-100 ${isLoaded ? 'translate-x-0' : '-translate-x-[100vw]'} bg-[length:100%_300%] bg-[position:0%_50%]`} style={{ backgroundImage: `url(${leftSide})` }} />
      <div className={`absolute top-[40%] left-0 w-[10%] h-[20%] bg-transparent bg-no-repeat transition-transform duration-2000 ease-out delay-200 ${isLoaded ? 'translate-x-0' : '-translate-x-[100vw]'} bg-[length:100%_300%] bg-[position:0%_100%]`} style={{ backgroundImage: `url(${leftSide})` }} />

      <div className={`absolute top-0 right-0 w-[10%] h-[20%] bg-transparent bg-no-repeat transition-transform duration-2000 ease-out delay-0 ${isLoaded ? 'translate-x-0' : 'translate-x-[100vw]'} bg-[length:100%_300%] bg-[position:0%_0%]`} style={{ backgroundImage: `url(${rightSide})` }} />
      <div className={`absolute top-[20%] right-0 w-[10%] h-[20%] bg-transparent bg-no-repeat transition-transform duration-2000 ease-out delay-100 ${isLoaded ? 'translate-x-0' : 'translate-x-[100vw]'} bg-[length:100%_300%] bg-[position:0%_50%]`} style={{ backgroundImage: `url(${rightSide})` }} />
      <div className={`absolute top-[40%] right-0 w-[10%] h-[20%] bg-transparent bg-no-repeat transition-transform duration-2000 ease-out delay-200 ${isLoaded ? 'translate-x-0' : 'translate-x-[100vw]'} bg-[length:100%_300%] bg-[position:0%_100%]`} style={{ backgroundImage: `url(${rightSide})` }} />

      <div className={`absolute bottom-0 left-0 w-[20%] h-[20%] bg-transparent bg-cover bg-center transition-transform duration-2000 ease-out ${isLoaded ? 'translate-x-0 translate-y-0' : '-translate-x-[100vw] translate-y-[100vh]'}`} style={{ backgroundImage: `url(${bottomLeft})` }} />
      <div className={`absolute bottom-0 right-0 w-[20%] h-[20%] bg-transparent bg-cover bg-center transition-transform duration-2000 ease-out ${isLoaded ? 'translate-x-0 translate-y-0' : 'translate-x-[100vw] translate-y-[100vh]'}`} style={{ backgroundImage: `url(${bottomRight})` }} />

      {/* --- TRANSLUCENT FORM BOX --- */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 
          bg-black/50 backdrop-blur-xl border border-white/20 
          p-8 md:p-10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] 
          transition-all duration-700 delay-[2000ms] 
          w-11/12 max-w-5xl
          ${isLoaded ? 'opacity-100 translate-y-[-45%]' : 'opacity-0 translate-y-[-35%]'}`}
      >
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 text-center mb-6 uppercase tracking-wider">
          Register for Exodia
        </h1>

        {/* Status Message Display */}
        {statusMsg.text && (
          <div className={`mb-6 p-4 rounded-lg text-center font-bold ${statusMsg.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/50' : 'bg-red-500/20 text-red-300 border border-red-500/50'}`}>
            {statusMsg.text}
          </div>
        )}

        <div className="flex flex-col lg:flex-row items-start gap-12">
          
          {/* Left Side: QR Code & Info */}
          <div className="flex flex-col items-center justify-center w-full lg:w-1/3 p-6 bg-white/5 rounded-xl border border-white/10">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=example@upi&pn=Exodia" alt="Payment QR Code" className="w-48 h-48 border-4 border-yellow-500 rounded-lg shadow-lg mb-4" />
            <p className="text-lg font-bold text-white mb-1">Scan to Pay</p>
            <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-200 px-4 py-2 rounded-md mt-4 text-center w-full">
              <p className="text-sm font-semibold">Registration Fee:</p>
              <p className="text-2xl font-bold tracking-wider">₹2,600</p>
              <p className="text-sm font-semibold">per person</p>
            </div>
            <p className="mt-4 text-xs text-gray-400 text-center">
              Please complete the payment before filling out this form. Ensure you save the Transaction ID.
            </p>
          </div>

          {/* Right Side: Form Inputs */}
          <form className="w-full lg:w-2/3 flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
                <input name="fullName" value={formData.fullName} onChange={handleInputChange} type="text" placeholder="John Doe" required className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-white/10 text-white placeholder-gray-500 transition-all" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                <input name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="john@example.com" required className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-white/10 text-white placeholder-gray-500 transition-all" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-300 ml-1">Phone Number</label>
                <input name="phone" value={formData.phone} onChange={handleInputChange} type="tel" placeholder="+91 98765 43210" required className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-white/10 text-white placeholder-gray-500 transition-all" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-300 ml-1">Institute Name</label>
                <input name="institute" value={formData.institute} onChange={handleInputChange} type="text" placeholder="XYZ College of Engineering" required className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-white/10 text-white placeholder-gray-500 transition-all" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-300 ml-1">Contingent Size</label>
                <input name="contingentSize" value={formData.contingentSize} onChange={handleInputChange} type="number" min="1" placeholder="e.g. 1" required className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-white/10 text-white placeholder-gray-500 transition-all" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-300 ml-1">Total Amount Paid (₹)</label>
                <input name="amountPaid" value={formData.amountPaid} onChange={handleInputChange} type="number" placeholder="2600" required className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-white/10 text-white placeholder-gray-500 transition-all" />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Transaction ID</label>
                <input name="transactionId" value={formData.transactionId} onChange={handleInputChange} type="text" placeholder="UPI Ref / Transaction Number" required className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-white/10 text-white placeholder-gray-500 transition-all font-mono" />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-sm font-medium text-gray-300 ml-1">Proof of Payment (Screenshot)</label>
                <input id="file-upload" type="file" onChange={handleFileChange} accept="image/*" required className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500 focus:bg-white/10 text-gray-300 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-black hover:file:bg-yellow-400 cursor-pointer" />
              </div>

            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`mt-4 w-full py-4 text-black font-extrabold text-lg rounded-xl transition-all transform ${isSubmitting ? 'bg-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.4)] hover:shadow-[0_0_25px_rgba(234,179,8,0.6)] hover:-translate-y-1'}`}
            >
              {isSubmitting ? 'Submitting Registration...' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};