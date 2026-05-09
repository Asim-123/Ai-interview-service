'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { auth } from '@/lib/firebase';
import Navbar from '@/components/Navbar';

export default function ResumePage() {
  const router = useRouter();
  const { user, loading, userData, setUserData } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleFileUpload = async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    setUploading(true);
    setUploadSuccess(false);

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUserData({ ...userData, resume: data.resume });
        setUploadSuccess(true);
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-cyan"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
            Resume Manager
          </h1>
          <p className="text-gray-400 mb-8">
            Upload your resume to get personalized interview answers based on your experience
          </p>

          {/* Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            className={`glass-panel rounded-xl p-12 text-center border-2 border-dashed transition-all ${
              dragActive ? 'border-neon-cyan bg-gray-800/50' : 'border-gray-700'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleChange}
              disabled={uploading}
              className="hidden"
              id="fileInput"
            />
            
            <label htmlFor="fileInput" className="cursor-pointer">
              <div className="text-6xl mb-4">📄</div>
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-cyan mx-auto mb-4"></div>
                  <p className="text-lg text-gray-300">Processing your resume...</p>
                </>
              ) : (
                <>
                  <p className="text-xl font-semibold text-white mb-2">
                    Drop your resume here or click to upload
                  </p>
                  <p className="text-gray-400">PDF format only, max 5MB</p>
                </>
              )}
            </label>
          </div>

          {/* Success Message */}
          {uploadSuccess && (
            <div className="mt-6 p-4 bg-green-500/20 border border-green-500 rounded-lg">
              <p className="text-green-400 font-semibold">✅ Resume uploaded successfully!</p>
              <p className="text-gray-400 text-sm mt-1">
                Your interview answers will now be personalized based on your experience.
              </p>
            </div>
          )}

          {/* Resume Preview */}
          {userData?.resume && (
            <div className="mt-8 glass-panel rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4 text-neon-cyan">Your Resume Data</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Name</h3>
                  <p className="text-white">{userData.resume.name}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {userData.resume.skills.map((skill: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-neon-cyan/20 border border-neon-cyan text-neon-cyan rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Experience</h3>
                  <ul className="space-y-2">
                    {userData.resume.experience.map((exp: string, i: number) => (
                      <li key={i} className="text-gray-300">• {exp}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Target Roles</h3>
                  <div className="flex flex-wrap gap-2">
                    {userData.resume.targetRoles.map((role: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-neon-purple/20 border border-neon-purple text-neon-purple rounded-full text-sm"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => document.getElementById('fileInput')?.click()}
                className="mt-6 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Upload New Resume
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
