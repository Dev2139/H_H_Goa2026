import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Generator from './pages/Generator';
import Preview from './pages/Preview';
import About from './pages/About';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Router>
      <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#05070f]">
        {/* Animated Background gradients */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-brand-purple/10 blur-[150px] animate-float-slow" />
        <div className="pointer-events-none absolute top-[40%] -right-40 h-[600px] w-[600px] rounded-full bg-brand-orange/10 blur-[150px] animate-float-delayed" />
        <div className="pointer-events-none absolute -bottom-40 left-[20%] h-[500px] w-[500px] rounded-full bg-brand-blue/10 blur-[120px] animate-float-slow" />

        <Header />
        
        {/* Main Content Area */}
        <main className="flex-grow z-10 flex flex-col justify-center">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/generate" element={<Generator />} />
            <Route path="/share/:shareId" element={<Preview />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
        
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(12, 15, 29, 0.85)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              backdropFilter: 'blur(16px)',
            },
          }}
        />
      </div>
    </Router>
  );
}
