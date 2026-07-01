import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  Activity, 
  Users, 
  Building2, 
  MessageSquare,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const LandingPage = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const stats = [
    { label: 'Registered Pharmacies', value: '450+', icon: Building2 },
    { label: 'Active Users', value: '12K+', icon: Users },
    { label: 'Average Response Time', value: '45s', icon: Clock },
    { label: 'Successful Pickups', value: '98.4%', icon: ShieldCheck }
  ];

  const features = [
    {
      title: 'Real-time Medicine Search',
      desc: 'Type your medicine name once. Our system instantly broadcasts requests to nearby pharmacies within a 5-10 km radius.',
      icon: Search,
      color: 'bg-blue-500/10 text-primary'
    },
    {
      title: 'Geospatial Smart Routing',
      desc: 'View which stores have availability, compare distances, and navigate to the selected store using our integrated maps.',
      icon: MapPin,
      color: 'bg-emerald-500/10 text-success'
    },
    {
      title: 'Instant Reservations',
      desc: 'Reserve your medication with a single click. Receive a secure pickup QR code that guarantees stock when you arrive.',
      icon: ShieldCheck,
      color: 'bg-orange-500/10 text-warning'
    }
  ];

  const workflow = [
    { step: '01', title: 'Search Medicine', desc: 'Enter the medicine name, strength, and quantity you need on the dashboard.' },
    { step: '02', title: 'Radar Broadcast', desc: 'The request is sent to all registered pharmacies in your vicinity instantly.' },
    { step: '03', title: 'Live Responses', desc: 'Pharmacies check inventory and respond in real-time. View live matching results.' },
    { step: '04', title: 'Reserve & Collect', desc: 'Reserve your items, navigate using integrated routes, and collect with a QR code.' }
  ];

  const faqs = [
    {
      q: 'How does MediPing AI find medicine availability?',
      a: 'When you search for a medicine, our system identifies all registered pharmacies within a 5-10 km radius of your location. We send a real-time notification to these pharmacies. Pharmacists can instantly check their physical stock and click "Available" or "Unavailable," which updates on your screen in real time.'
    },
    {
      q: 'Is my reservation guaranteed?',
      a: 'Yes. When a pharmacy responds that a medicine is available and you click "Reserve", the pharmacy\'s dashboard places your request in their active pickup queue and deducts it from their digital stock. You receive a secure QR code and OTP to verify your pick-up at the counter.'
    },
    {
      q: 'How much does it cost to use MediPing AI?',
      a: 'MediPing AI is completely free for patients looking for medicine. Pharmacies can access basic features for free, with premium analytics and inventory synchronization tools available under our subscription plans.'
    },
    {
      q: 'Can pharmacies update their inventory automatically?',
      a: 'Yes, pharmacies can upload and manage their inventory directly in their dashboard. Alternatively, they can receive live search requests and verify stock manually on their tablets or computers.'
    }
  ];

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-100 pt-40 sm:pt-48 lg:pt-56 pb-20 lg:pb-32 bg-grid-pattern flex-grow">
        {/* Animated Orbs */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-success/5 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left"
          >
            <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 text-primary py-1.5 px-3.5 rounded-full font-semibold text-xs tracking-wider uppercase mb-6">
              <Activity size={12} className="animate-pulse" />
              <span>Real-Time Medicine Locator</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight mb-6 font-display">
              Find Available Medicines <br />
              <span className="text-primary">Instantly. Nearby.</span>
            </h1>
            
            <p className="text-lg text-slate-600 max-w-xl mb-10 leading-relaxed font-sans">
              Stop calling and wasting hours visiting multiple pharmacies. Search once, ping nearby stores, and get live availability responses in seconds. Reserve with a tap.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/login"
                className="bg-primary text-white hover:bg-primary-dark px-8 py-4 rounded-full font-semibold shadow-lg shadow-primary/25 transition-all flex items-center justify-center space-x-2 group hover:scale-[1.02]"
              >
                <span>Find Medicine Now</span>
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                to="/register-pharmacy"
                className="bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200 px-8 py-4 rounded-full font-semibold transition-all flex items-center justify-center"
              >
                Register Your Pharmacy
              </Link>
            </div>
          </motion.div>

          {/* Premium Visual / Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative flex justify-center"
          >
            <div className="premium-card bg-white p-6 max-w-[480px] w-full border border-slate-200/50 shadow-2xl relative">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    <Search size={18} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-sm">Active Search Radar</div>
                    <div className="text-xs text-slate-500">Searching 12 pharmacies...</div>
                  </div>
                </div>
                <div className="text-xs font-semibold px-2.5 py-1 bg-success/15 text-success rounded-full flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping"></span>
                  <span>9 Received</span>
                </div>
              </div>

              {/* Mock Live Responses */}
              <div className="mt-4 space-y-3.5">
                <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-4 flex justify-between items-center transition-all hover:border-slate-200">
                  <div>
                    <h5 className="font-semibold text-slate-800 text-sm">Apollo Pharmacy</h5>
                    <p className="text-xs text-slate-500 mt-0.5">650 meters away • 12 Strips</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block text-xs font-semibold px-2 py-0.5 bg-success/10 text-success rounded-full mb-1.5">Available</span>
                    <div className="text-xs font-bold text-slate-800">$15.00</div>
                  </div>
                </div>

                <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-4 flex justify-between items-center">
                  <div>
                    <h5 className="font-semibold text-slate-800 text-sm">LifeCare Pharmacy</h5>
                    <p className="text-xs text-slate-500 mt-0.5">1.2 km away • 80 Strips</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block text-xs font-semibold px-2 py-0.5 bg-success/10 text-success rounded-full mb-1.5">Available</span>
                    <div className="text-xs font-bold text-slate-800">$18.00</div>
                  </div>
                </div>

                <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-4 flex justify-between items-center opacity-70">
                  <div>
                    <h5 className="font-semibold text-slate-800 text-sm">Gupta Medical Store</h5>
                    <p className="text-xs text-slate-500 mt-0.5">1.3 km away • Out of Stock</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block text-xs font-semibold px-2 py-0.5 bg-slate-200 text-slate-500 rounded-full mb-1.5">Unavailable</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-slate-100 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex flex-col items-center p-4 bg-white rounded-2xl border border-slate-200/40 shadow-sm">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-3">
                    <Icon size={20} />
                  </div>
                  <div className="text-3xl font-extrabold text-slate-800 font-display">{stat.value}</div>
                  <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 font-display">Why Choose MediPing AI?</h2>
          <p className="text-slate-600">We leverage real-time technologies to build a seamless availability network that eliminates friction from medicine retrieval.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="premium-card bg-white p-8 border border-slate-200/50 flex flex-col text-left">
                <div className={`w-12 h-12 rounded-2xl ${feat.color} flex items-center justify-center mb-6 shadow-sm`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 font-display">{feat.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 font-display">How MediPing AI Works</h2>
            <p className="text-slate-600">Four simple steps to locate, reserve, and pick up your prescription medication.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {workflow.map((item, i) => (
              <div key={i} className="bg-slate-50/60 border border-slate-200/50 rounded-2xl p-6 text-left relative flex flex-col justify-between">
                <div>
                  <span className="text-primary/25 font-extrabold text-4xl font-display block mb-4">{item.step}</span>
                  <h4 className="font-bold text-slate-800 text-base mb-2 font-display">{item.title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-24 max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 font-display">Frequently Asked Questions</h2>
          <p className="text-slate-600 text-sm">Have questions about the platform? Read our detailed FAQ below.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex justify-between items-center p-6 text-left font-semibold text-slate-800 hover:text-slate-950 font-display transition-colors"
              >
                <span>{faq.q}</span>
                {activeFaq === index ? <ChevronUp size={18} className="text-primary" /> : <ChevronDown size={18} className="text-slate-400" />}
              </button>
              
              {activeFaq === index && (
                <div className="px-6 pb-6 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
        <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display mb-6">Ready to Find Your Medicine?</h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-10 leading-relaxed text-sm sm:text-base">
            Join thousands of users who have saved countless hours locating critical medications. Set up your search or list your pharmacy today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/login"
              className="bg-primary text-white hover:bg-primary-dark px-8 py-4 rounded-full font-semibold shadow-lg shadow-primary/30 transition-all flex items-center justify-center space-x-2"
            >
              <span>Get Started (Free)</span>
              <ArrowRight size={18} />
            </Link>
            <Link 
              to="/register-pharmacy"
              className="bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 px-8 py-4 rounded-full font-semibold transition-all"
            >
              Join as a Pharmacy Partner
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 text-slate-500 py-12 border-t border-slate-200/60 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="MediPing AI" className="h-20 w-auto object-contain mix-blend-multiply hover:opacity-90 transition-opacity" />
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 font-medium">
            <a href="#features" className="text-slate-500 hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="text-slate-500 hover:text-slate-900 transition-colors">How It Works</a>
            <Link to="/login" className="text-slate-500 hover:text-slate-900 transition-colors">Sign In</Link>
            <Link to="/register-pharmacy" className="text-slate-500 hover:text-slate-900 transition-colors">Pharmacy Registration</Link>
          </div>

          <div className="text-slate-400">
            &copy; {new Date().getFullYear()} MediPing AI Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
