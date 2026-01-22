import React, { useState, useEffect } from 'react';
import { useTenantContext } from '../TenantContext';
import { superAdminApi } from '@/services/api/superAdminApi';
import { Loader2 } from 'lucide-react';

const TenantUsersPage: React.FC = () => {
    const { tenant } = useTenantContext();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenant) return;

        const fetchUsers = async () => {
            try {
                const data = await superAdminApi.getTenantUsers(tenant.id);
                setUsers(data);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [tenant?.id]);

    if (!tenant) return null;

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Authorized Personnel</h3>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{users.length} Users</span>
            </div>

            <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Identity</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Role Authority</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Last Active</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {loading ? (
                        <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400 font-medium">
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" /> Synchronizing with user registry...
                            </div>
                        </td></tr>
                    ) : users.length > 0 ? users.map(user => (
                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="text-sm font-bold text-slate-800">{user.full_name}</div>
                                <div className="text-xs text-slate-500">{user.email}</div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${user.role === 'admin' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-xs font-medium text-slate-500">
                                {new Date(user.updated_at).toLocaleDateString()}
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400 font-medium">No users found for this node.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TenantUsersPage;
