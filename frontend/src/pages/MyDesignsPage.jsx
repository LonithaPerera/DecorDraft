import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
    LayoutGrid,
    Trash2,
    Pencil,
    Calendar,
    Ruler,
    Layers,
    Plus,
    Clock,
    Box,
    ArrowRight,
    X,
    Check
} from 'lucide-react';

const ROOM_PREVIEWS = [
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1598928636135-d146006ff4be?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800',
];

const DesignCard = ({ 
    design, 
    idx, 
    user, 
    startRename, 
    handleDelete, 
    renamingId, 
    renameValue, 
    setRenameValue, 
    commitRename, 
    setRenamingId, 
    formatDate,
    isTemplate = false 
}) => {
    const canEdit = user?.role === 'admin' || design.creator?._id === user?.id || !isTemplate;

    return (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group">
            <div className="relative h-48 overflow-hidden bg-gray-100">
                <img
                    src={design.thumbnail || ROOM_PREVIEWS[idx % ROOM_PREVIEWS.length]}
                    alt={design.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                
                {isTemplate && (
                    <div className="absolute top-4 left-4 bg-[#A85517] text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg shadow-lg">
                        Official Template
                    </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                        to={`/editor?design=${design._id}`}
                        className="flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-xl font-bold text-xs shadow-xl hover:bg-[#A85517] hover:text-white transition-all"
                    >
                        {isTemplate ? 'Use as Template' : 'Open in Editor'} <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>

            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    {renamingId === design._id ? (
                        <div className="flex items-center gap-2 flex-1 mr-2">
                            <input
                                autoFocus
                                value={renameValue}
                                onChange={e => setRenameValue(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') commitRename(design._id); if (e.key === 'Escape') setRenamingId(null); }}
                                className="w-full text-sm font-bold border border-orange-200 rounded-lg px-2 py-1 outline-none ring-1 ring-orange-200"
                            />
                            <button onClick={() => commitRename(design._id)} className="text-green-500 hover:text-green-600"><Check className="w-4 h-4" /></button>
                            <button onClick={() => setRenamingId(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                        </div>
                    ) : (
                        <h3 className="text-sm font-black text-gray-900 leading-snug flex-1 mr-2">{design.name}</h3>
                    )}
                    {canEdit && (
                        <button onClick={() => startRename(design)} className="text-gray-300 hover:text-[#A85517] transition-colors shrink-0 p-1 rounded-lg hover:bg-orange-50">
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(design.updatedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                        <Ruler className="w-3 h-3" />
                        <span>{design.roomSettings?.width}m × {design.roomSettings?.depth}m</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
                        <Layers className="w-3 h-3" />
                        <span>{design.furnitureItems?.length || 0} items</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: design.roomSettings?.wallColor }} title="Wall color" />
                        <div className="w-4 h-4 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: design.roomSettings?.floorColor }} title="Floor color" />
                    </div>
                    {canEdit && (
                        <button onClick={() => handleDelete(design._id)} className="p-2 rounded-xl border border-gray-100 text-gray-300 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const MyDesignsPage = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [designs, setDesigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [renamingId, setRenamingId] = useState(null);
    const [renameValue, setRenameValue] = useState('');

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                navigate('/login');
                return;
            }
            fetchDesigns();
        }
    }, [user, authLoading]);

    const fetchDesigns = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/designs`);
            setDesigns(res.data);
        } catch (err) {
            console.error('Error fetching designs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this design permanently?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/designs/${id}`);
            setDesigns(prev => prev.filter(d => d._id !== id));
        } catch (err) {
            console.error('Error deleting design:', err);
        }
    };

    const startRename = (design) => {
        setRenamingId(design._id);
        setRenameValue(design.name);
    };

    const commitRename = async (id) => {
        if (!renameValue.trim()) return;
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/designs/${id}`, { name: renameValue });
            setDesigns(prev => prev.map(d => d._id === id ? { ...d, name: renameValue } : d));
        } catch (err) {
            console.error('Error renaming design:', err);
        } finally {
            setRenamingId(null);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getInitial = (name) => name ? name[0].toUpperCase() : '?';

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FDFCF9] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-[#A85517] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Designs...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFCF9] pt-24">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">

                {/* ── Profile Header ── */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#A85517] to-[#7a3c10] flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-orange-200">
                            {getInitial(user?.name)}
                        </div>
                        <div>
                            <h1 className="text-3xl font-serif font-black text-gray-900 tracking-tight">My Designs</h1>
                            <p className="text-sm text-gray-400 font-medium mt-0.5">Welcome back, <span className="text-gray-600 font-bold">{user?.name}</span></p>
                            <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-widest bg-orange-50 text-[#A85517] border border-orange-100 rounded-full px-3 py-0.5">
                                {user?.role || 'Customer'}
                            </span>
                        </div>
                    </div>
                    <Link
                        to="/editor"
                        className="flex items-center gap-2 bg-[#111827] hover:bg-[#A85517] text-white px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg"
                    >
                        <Plus className="w-4 h-4" />
                        New Design
                    </Link>
                </div>

                {/* ── Stats Row ── */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                    {[
                        { label: 'Total Designs', value: designs.length, icon: LayoutGrid, color: 'text-[#A85517]', bg: 'bg-orange-50' },
                        { label: 'Furniture Placed', value: designs.reduce((t, d) => t + (d.furnitureItems?.length || 0), 0), icon: Box, color: 'text-blue-500', bg: 'bg-blue-50' },
                        { label: 'Last Active', value: designs.length > 0 ? formatDate(designs[0].updatedAt) : 'Never', icon: Clock, color: 'text-purple-500', bg: 'bg-purple-50' },
                    ].map(({ label, value, icon: Icon, color, bg }) => (
                        <div key={label} className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-between shadow-sm">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                                <p className="text-2xl font-black text-gray-900">{value}</p>
                            </div>
                            <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
                                <Icon className={`w-5 h-5 ${color}`} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Designs Portfolio ── */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-black text-gray-800 flex items-center gap-3">
                            <Layers className="w-5 h-5 text-[#A85517]" />
                            Official Templates
                        </h2>
                        <span className="text-xs text-gray-400 font-bold">{designs.filter(d => d.creator?.role === 'admin').length} templates</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4 mb-16">
                        {designs.filter(d => d.creator?.role === 'admin').map((design, idx) => (
                            <DesignCard 
                                key={design._id} 
                                design={design} 
                                idx={idx} 
                                user={user} 
                                startRename={startRename} 
                                handleDelete={handleDelete}
                                renamingId={renamingId}
                                renameValue={renameValue}
                                setRenameValue={setRenameValue}
                                commitRename={commitRename}
                                setRenamingId={setRenamingId}
                                formatDate={formatDate}
                                isTemplate={true}
                            />
                        ))}
                        {designs.filter(d => d.creator?.role === 'admin').length === 0 && (
                            <div className="col-span-full py-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No official templates available</p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-black text-gray-800 flex items-center gap-3">
                            <LayoutGrid className="w-5 h-5 text-[#A85517]" />
                            Your Private Portfolio
                        </h2>
                        <span className="text-xs text-gray-400 font-bold">{designs.filter(d => d.creator?.role !== 'admin').length} saved designs</span>
                    </div>

                    {designs.length === 0 ? (
                        <div className="text-center py-24 space-y-6">
                            <div className="w-24 h-24 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto border-2 border-dashed border-orange-200">
                                <LayoutGrid className="w-10 h-10 text-[#A85517]/40" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-800 mb-2">No designs yet</h3>
                                <p className="text-sm text-gray-400 max-w-xs mx-auto">Start designing your dream room. Your saved designs will appear here.</p>
                            </div>
                            <Link to="/editor" className="inline-flex items-center gap-2 bg-[#A85517] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#8a4413] transition-colors shadow-lg shadow-orange-200">
                                <Plus className="w-4 h-4" /> Start New Design
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
                            <Link to="/editor" className="group border-2 border-dashed border-gray-200 hover:border-[#A85517] rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-all duration-200 min-h-[320px] hover:bg-orange-50/50">
                                <div className="w-12 h-12 bg-gray-100 group-hover:bg-orange-100 rounded-xl flex items-center justify-center transition-colors">
                                    <Plus className="w-6 h-6 text-gray-400 group-hover:text-[#A85517]" />
                                </div>
                                <p className="text-sm font-black text-gray-400 group-hover:text-[#A85517] uppercase tracking-widest transition-colors">New Design</p>
                            </Link>

                            {designs.filter(d => d.creator?.role !== 'admin').map((design, idx) => (
                                <DesignCard 
                                    key={design._id} 
                                    design={design} 
                                    idx={idx} 
                                    user={user} 
                                    startRename={startRename} 
                                    handleDelete={handleDelete}
                                    renamingId={renamingId}
                                    renameValue={renameValue}
                                    setRenameValue={setRenameValue}
                                    commitRename={commitRename}
                                    setRenamingId={setRenamingId}
                                    formatDate={formatDate}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyDesignsPage;
