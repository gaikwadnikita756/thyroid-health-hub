import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Heart, Mail, Shield } from 'lucide-react';

const PublicFooter: React.FC = () => (
  <footer className="bg-medical-grey-dark text-sidebar-foreground pt-12 pb-6 mt-0">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-sidebar-foreground">ThyroSmart</span>
          </div>
          <p className="text-sm opacity-70 leading-relaxed">
            Advanced thyroid health education and AI-assisted screening for early detection and awareness.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider opacity-80">Learn</h4>
          <ul className="space-y-2 text-sm opacity-70">
            <li><Link to="/about" className="hover:opacity-100 transition-opacity">About Thyroid</Link></li>
            <li><Link to="/symptoms" className="hover:opacity-100 transition-opacity">Symptoms & Risk Factors</Link></li>
            <li><Link to="/tests" className="hover:opacity-100 transition-opacity">Tests & Diagnosis</Link></li>
            <li><Link to="/prevention" className="hover:opacity-100 transition-opacity">Prevention & Self-Care</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider opacity-80">Tools</h4>
          <ul className="space-y-2 text-sm opacity-70">
            <li><Link to="/ai-screening" className="hover:opacity-100 transition-opacity">AI Risk Screening</Link></li>
            <li><Link to="/patient/dashboard" className="hover:opacity-100 transition-opacity">Patient Portal</Link></li>
            <li><Link to="/doctor/dashboard" className="hover:opacity-100 transition-opacity">Doctor Dashboard</Link></li>
            <li><Link to="/faq" className="hover:opacity-100 transition-opacity">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider opacity-80">Legal</h4>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-white/5 mb-3">
            <Shield className="w-4 h-4 mt-0.5 text-warning shrink-0" />
            <p className="text-xs opacity-70 leading-relaxed">
              This website is for educational purposes only. Always consult a qualified healthcare professional for medical advice, diagnosis, or treatment.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm opacity-70">
            <Mail className="w-4 h-4" />
            <span>contact@thyrosmart.health</span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 pt-5 flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-xs opacity-50">© 2025 ThyroSmart. Educational use only — not medical advice.</p>
        <div className="flex items-center gap-1 text-xs opacity-50">
          <span>Made with</span>
          <Heart className="w-3 h-3 text-red-400" />
          <span>for thyroid health awareness</span>
        </div>
      </div>
    </div>
  </footer>
);

export default PublicFooter;
