import React, { useState, useEffect } from 'react';
import {
    PlusIcon,
    TrashIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline';
import {
    HolographicCard,
    CyberButton
} from './NextGenUI';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

interface Integration {
    id: number;
    platform: string;
    account_name: string;
    account_id: string;
    status: string;
    last_synced_at?: string;
}

const MarketingIntegrations: React.FC = () => {
    const { user } = useAuthStore();
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [loading, setLoading] = useState(true);
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        account_name: '',
        account_id: '',
        api_key: '' // Note: specific fields depend on platform
    });

    useEffect(() => {
        loadIntegrations();
    }, []);

    const loadIntegrations = async () => {
        try {
            const response = await api.get('/marketing/integrations');
            setIntegrations(response.data);
        } catch (error) {
            console.error('Error loading integrations:', error);
            toast.error('Failed to load integrations');
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPlatform) return;

        try {
            // In a real app, this would redirect to OAuth or validate keys
            // Here we just create the integration record
            const payload = {
                store_id: user?.store_id,
                platform: selectedPlatform,
                account_name: formData.account_name,
                account_id: formData.account_id,
                access_token: formData.api_key // Map API Key to access_token
            };

            await api.post('/marketing/integrations', payload);
            toast.success(`Connected to ${selectedPlatform.replace('_', ' ')}!`);
            setShowConnectModal(false);
            setFormData({ account_name: '', account_id: '', api_key: '' });
            loadIntegrations();
        } catch (error) {
            console.error('Connection error:', error);
            toast.error('Failed to connect account');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to disconnect this account?')) return;
        try {
            await api.delete(`/marketing/integrations/${id}`);
            toast.success('Account disconnected');
            loadIntegrations();
        } catch (error) {
            toast.error('Failed to disconnect');
        }
    };

    const handleSync = async (integration: Integration) => {
        try {
            toast.loading('Syncing campaigns...');
            const endpoint = integration.platform === 'google_ads'
                ? `/marketing/sync/google-ads/${integration.id}`
                : `/marketing/sync/meta-ads/${integration.id}`; // Default fallback

            await api.post(endpoint);
            toast.dismiss();
            toast.success('Sync complete!');
            loadIntegrations();
        } catch (error) {
            toast.dismiss();
            toast.error('Sync failed');
        }
    };

    const platforms = [
        { id: 'google_ads', name: 'Google Ads', icon: 'G', color: 'blue' },
        { id: 'meta_ads', name: 'Meta Ads', icon: 'M', color: 'indigo' },
        { id: 'whatsapp', name: 'WhatsApp Business', icon: 'W', color: 'emerald' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <GlobeAltIcon className="w-8 h-8 text-cyan-400" />
                    Ad Platforms & Integrations
                </h2>
                <CyberButton icon={PlusIcon} onClick={() => {
                    setSelectedPlatform('google_ads');
                    setShowConnectModal(true);
                }}>
                    Connect New Account
                </CyberButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations.map((int) => (
                    <HolographicCard key={int.id} className="relative group">
                        <div className="absolute top-4 right-4 text-emerald-400">
                            <CheckCircleIcon className="w-6 h-6" />
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                            <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold
                ${int.platform === 'google_ads' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                    int.platform === 'meta_ads' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}
              `}>
                                {int.platform === 'google_ads' ? 'G' : int.platform === 'meta_ads' ? 'M' : 'W'}
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg capitalize">{int.platform.replace('_', ' ')}</h3>
                                <p className="text-gray-400 text-sm">{int.account_name}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Account ID:</span>
                                <span className="text-gray-200 font-mono">{int.account_id}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Status:</span>
                                <span className="text-emerald-400 font-bold uppercase text-xs tracking-wider border border-emerald-500/30 px-2 py-0.5 rounded-full">
                                    {int.status}
                                </span>
                            </div>
                            {int.last_synced_at && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Last Synced:</span>
                                    <span className="text-gray-400">{new Date(int.last_synced_at).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
                            <CyberButton
                                variant="secondary"
                                size="sm"
                                icon={ArrowPathIcon}
                                className="flex-1"
                                onClick={() => handleSync(int)}
                            >
                                Sync
                            </CyberButton>
                            <button
                                className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 rounded-lg transition-colors"
                                onClick={() => handleDelete(int.id)}
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </HolographicCard>
                ))}

                {integrations.length === 0 && !loading && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-white/10 rounded-3xl">
                        <GlobeAltIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-400 mb-2">No Active Integrations</h3>
                        <p className="text-gray-500 mb-6">Connect your ad accounts to start orchestrating campaigns.</p>
                        <CyberButton onClick={() => {
                            setSelectedPlatform('google_ads');
                            setShowConnectModal(true);
                        }}>
                            Connect Account
                        </CyberButton>
                    </div>
                )}
            </div>

            {/* Connection Modal */}
            {showConnectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden relative">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Connect Account</h3>
                            <button
                                onClick={() => setShowConnectModal(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleConnect} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-400 mb-2">Platform</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {platforms.map(p => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => setSelectedPlatform(p.id)}
                                            className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${selectedPlatform === p.id
                                                ? 'bg-purple-600/20 border-purple-500 text-purple-400'
                                                : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            <span className="font-bold text-lg">{p.icon}</span>
                                            <span className="text-xs">{p.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-400 mb-2">Account Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.account_name}
                                    onChange={e => setFormData({ ...formData, account_name: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none"
                                    placeholder="e.g. My Business Ads"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-400 mb-2">Account ID</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.account_id}
                                    onChange={e => setFormData({ ...formData, account_id: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none"
                                    placeholder="e.g. 123-456-7890"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-400 mb-2">API Key / Token</label>
                                <input
                                    type="password"
                                    value={formData.api_key}
                                    onChange={e => setFormData({ ...formData, api_key: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none"
                                    placeholder="Paste your API key here"
                                />
                                <p className="text-xs text-gray-500 mt-1">This will be encrypted securely.</p>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <CyberButton
                                    type="submit"
                                    className="flex-1 justify-center"
                                >
                                    Connect Account
                                </CyberButton>
                                <button
                                    type="button"
                                    onClick={() => setShowConnectModal(false)}
                                    className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketingIntegrations;
