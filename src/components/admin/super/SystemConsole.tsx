import React from 'react';
import {
    Power,
    CheckCircle2,
    X,
    Zap,
    MessageSquare
} from 'lucide-react';
import { Switch } from './AdminShared';

interface SystemConsoleProps {
    settings: any;
    onUpdate: (key: string, value: any) => void;
}

export const SystemConsole: React.FC<SystemConsoleProps> = ({ settings, onUpdate }) => {
    if (!settings) return null;

    const maintenance = settings.maintenance_mode?.value || { enabled: false, message: '' };
    const registration = settings.registration_open?.value || { enabled: true };
    const features = settings.global_feature_flags?.value || {};

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="border-b border-slate-200 pb-6">
                <h2 className="text-3xl font-black text-slate-900 mb-2">Platform Console</h2>
                <p className="text-slate-500 font-medium">Global master switches that override all tenant-level behaviors.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Maintenance Mode */}
                <div className={`p-6 rounded-3xl border shadow-sm transition-all ${maintenance.enabled ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-2xl ${maintenance.enabled ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            <Power className="h-6 w-6" />
                        </div>
                        <Switch
                            enabled={maintenance.enabled}
                            onToggle={() => onUpdate('maintenance_mode', { ...maintenance, enabled: !maintenance.enabled })}
                        />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Maintenance Mode</h3>
                    <p className="text-sm text-slate-500 mb-4">When enabled, tenants will see a countdown or maintenance screen and API requests will be blocked.</p>
                    {maintenance.enabled && (
                        <div className="animate-in zoom-in-95">
                            <label className="text-[10px] font-black uppercase text-indigo-400 block mb-1">Status Message</label>
                            <input
                                type="text"
                                value={maintenance.message}
                                onChange={(e) => onUpdate('maintenance_mode', { ...maintenance, message: e.target.value })}
                                className="w-full bg-white border border-indigo-100 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
                                placeholder="E.g. Database upgrade in progress..."
                            />
                        </div>
                    )}
                </div>

                {/* Registration */}
                <div className={`p-6 rounded-3xl border shadow-sm transition-all ${registration.enabled ? 'bg-white border-slate-200' : 'bg-rose-50 border-rose-200'}`}>
                    <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-2xl ${registration.enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-600 text-white'}`}>
                            {registration.enabled ? <CheckCircle2 className="h-6 w-6" /> : <X className="h-6 w-6" />}
                        </div>
                        <Switch
                            enabled={registration.enabled}
                            onToggle={() => onUpdate('registration_open', { ...registration, enabled: !registration.enabled })}
                        />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Public Registration</h3>
                    <p className="text-sm text-slate-500 mb-4">Toggle whether new businesses can self-onboard to the platform. Keep closed for private-beta or maintenance.</p>
                </div>
            </div>

            {/* Feature Flags */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-500" /> Platform Feature Toggles
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(features).map(([flag, enabled]) => (
                        <div key={flag} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                            <div>
                                <div className="text-sm font-bold text-slate-800 capitalize">{flag.replace(/_/g, ' ')}</div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{enabled ? 'Active' : 'Gated'}</div>
                            </div>
                            <Switch
                                enabled={enabled as boolean}
                                onToggle={() => onUpdate('global_feature_flags', { ...features, [flag]: !enabled })}
                            />
                        </div>
                    ))}
                    <button className="p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-bold text-sm">
                        + Define Flag
                    </button>
                </div>
            </div>

            {/* Platform Broadcast */}
            <div className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-indigo-400" /> Global Broadcast System
                </h3>
                <p className="text-slate-400 text-sm mb-6 font-medium">Send a top-bar banner notification to ALL active tenant dashboards instantly.</p>
                <div className="flex gap-3">
                    <input
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50"
                        placeholder="Type urgent platform message..."
                    />
                    <button className="bg-indigo-600 hover:bg-indigo-700 px-6 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-indigo-900/40">
                        Blast Banners
                    </button>
                </div>
            </div>
        </div>
    );
};
