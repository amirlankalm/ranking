"use client";
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Upload, X, Loader2, ImagePlus, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import imageCompression from 'browser-image-compression';

export default function AddPage() {
  const { user, requireAuth } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [instagram, setInstagram] = useState('');
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef(null);

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please upload a valid image file', 'error');
      return;
    }

    try {
      const options = {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 800,
        useWebWorker: true
      };
      
      const compressedFile = await imageCompression(file, options);
      setPhoto(compressedFile);
      setPreview(URL.createObjectURL(compressedFile));
    } catch (error) {
      addToast('Error compressing image', 'error');
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requireAuth()) return;
    if (!photo || !name || !studentClass || !instagram) {
      addToast('Please fill out all fields', 'error');
      return;
    }

    setLoading(true);

    try {
      // 1. Upload photo
      const fileExt = photo.name.split('.').pop() || 'jpg';
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('student-photos')
        .upload(filePath, photo);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('student-photos')
        .getPublicUrl(filePath);

      // 2. Insert record
      const { error: dbError } = await supabase
        .from('students')
        .insert({
          name: name.trim(),
          class: studentClass.trim().toUpperCase(),
          instagram_username: instagram.replace('@', '').trim(),
          photo_url: publicUrl,
          submitted_by: user.id
        });

      if (dbError) throw dbError;

      // 3. Show success
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 3500);

    } catch (error) {
      addToast(error.message, 'error');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, rotate: 360 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.5)] mb-6"
        >
          <CheckCircle2 className="w-12 h-12 text-black" />
        </motion.div>
        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="font-heading text-3xl font-bold"
        >
          Student Submitted!
        </motion.h2>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-accent-gold mt-2 font-medium"
        >
          Pending Admin Approval
        </motion.p>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-muted mt-2 text-sm"
        >
          Redirecting to leaderboard...
        </motion.p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto w-full pt-4"
    >
      <div className="mb-8 text-center sm:text-left">
        <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-3">Nominate Someone</h1>
        <p className="text-muted text-lg">Add an outstanding student to the ranking board.</p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-gold/10 blur-[100px] rounded-full pointer-events-none" />
        
        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          
          <div className="flex flex-col items-center gap-4">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handlePhotoSelect}
            />
            {preview ? (
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-accent-gold shadow-lg">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => { setPhoto(null); setPreview(''); }}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1.5 text-white shadow-lg md:opacity-0 md:group-hover:opacity-100 transition-opacity focus:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-32 rounded-full border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 hover:border-accent-gold/50 hover:bg-accent-gold/5 transition-colors text-muted hover:text-accent-gold"
              >
                <ImagePlus className="w-8 h-8" />
                <span className="text-xs font-medium">Upload Photo</span>
              </button>
            )}
            <p className="text-xs text-muted">Max 800px &bull; Forms will auto-compress</p>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5 pl-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g., Alisher Nurgaliyev"
                className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all placeholder:text-muted/40"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5 pl-1">Class</label>
                <input
                  type="text"
                  required
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  placeholder="11A"
                  className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all placeholder:text-muted/40 uppercase"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5 pl-1">Instagram</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">@</span>
                  <input
                    type="text"
                    required
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="username"
                    className="w-full bg-background/50 border border-white/10 rounded-xl pl-9 pr-4 py-3.5 text-white focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all placeholder:text-muted/40"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-gold hover:bg-yellow-400 text-black font-bold py-4 px-4 rounded-xl flex justify-center items-center gap-2 transition-all disabled:opacity-50 mt-8 shadow-[0_0_20px_rgba(245,197,24,0.15)] hover:shadow-[0_0_25px_rgba(245,197,24,0.3)] transform hover:-translate-y-0.5"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Publishing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" /> Submit to Ranking
              </>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
