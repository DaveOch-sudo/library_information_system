import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center shadow-xl shadow-red-100/50 border border-red-100">
            <ShieldAlert className="h-10 w-10 text-red-500" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Access Denied</h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            You do not have the required permissions to view this resource. 
            Please contact your administrator if you believe this is a mistake.
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98] text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
