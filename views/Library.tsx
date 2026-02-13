
import React, { useState, useRef } from 'react';
import { YearData } from '../types';
import { BookOpen, Download, Eye, Trash2, Plus, FileText, Upload, X } from 'lucide-react';

interface LibraryProps {
  data: YearData;
  updateData: (d: YearData) => void;
  userId?: string;
}

const PRE_LOADED_PDF_URL = '/Financial_Wellness_Morning_Money_Reset_Workbook.pdf';

const Library: React.FC<LibraryProps> = ({ data, updateData, userId }) => {
  const [showViewer, setShowViewer] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        const newDoc = {
          id: Math.random().toString(),
          title: file.name.replace('.pdf', ''),
          fileName: file.name,
          uploadedAt: new Date().toLocaleDateString(),
          fileData: base64Data
        };
        updateData({
          ...data,
          library: [newDoc, ...data.library]
        });
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please select a valid PDF file.");
    }
  };

  const removeDoc = (id: string) => {
    if (confirm("Are you sure you want to delete this resource?")) {
      updateData({
        ...data,
        library: data.library.filter(doc => doc.id !== id)
      });
    }
  };

  const openViewer = (dataUrl: string) => {
    if (window.innerWidth < 768) {
      const win = window.open();
      if (win) {
        win.document.write(`<iframe src="${dataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
      }
    } else {
      setShowViewer(dataUrl);
    }
  };

  const downloadDoc = (dataUrl: string, name: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${name}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold serif text-[#7B68A6] mb-1">Your Library</h1>
          <p className="text-gray-500 italic">Guides, workbooks, and resources for your journey</p>
        </div>
        <div className="flex gap-3">
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            accept=".pdf"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-[#B19CD9] text-white px-6 py-3 rounded-2xl hover:bg-opacity-90 transition-all shadow-lg shadow-[#B19CD9]/20 font-bold"
          >
            <Upload size={20} /> Upload PDF
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Pre-loaded Resource Card — now functional */}
        <div className="paper-card overflow-hidden group border-[#E6D5F0] flex flex-col h-full">
          <div className="h-48 bg-gradient-to-br from-[#7B68A6] to-[#B19CD9] flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 opacity-10 flex flex-wrap gap-4 p-4">
                {Array.from({ length: 12 }).map((_, i) => <BookOpen key={i} size={40} />)}
             </div>
             <div className="p-6 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-white flex flex-col items-center gap-2 relative z-10">
                <BookOpen size={48} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Guided Reset</span>
             </div>
          </div>
          <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
            <div>
              <h3 className="text-xl serif font-bold text-[#7B68A6] mb-2">Financial Wellness & Morning Money Reset</h3>
              <p className="text-sm text-gray-500 italic">Your 30-Day Journey to Financial Clarity & Abundance</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openViewer(PRE_LOADED_PDF_URL)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#F8F7FC] text-[#7B68A6] rounded-xl font-bold text-xs hover:bg-[#E6D5F0] transition-all"
              >
                <Eye size={16} /> View
              </button>
              <a
                href={PRE_LOADED_PDF_URL}
                download="Financial_Wellness_Morning_Money_Reset_Workbook.pdf"
                className="flex items-center justify-center p-3 bg-white border border-[#E6D5F0] text-[#7B68A6] rounded-xl hover:bg-[#E6D5F0] transition-all"
              >
                <Download size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* Uploaded User Library Items */}
        {data.library.map(doc => (
          <div key={doc.id} className="paper-card overflow-hidden group border-[#eee] flex flex-col h-full">
            <div className="h-48 bg-gray-50 flex items-center justify-center relative">
               <div className="p-6 bg-white rounded-2xl shadow-sm border border-[#eee] text-[#B19CD9] flex flex-col items-center gap-2">
                  <FileText size={48} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">PDF Document</span>
               </div>
               <button
                onClick={() => removeDoc(doc.id)}
                className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm text-red-400 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50"
               >
                 <Trash2 size={18} />
               </button>
            </div>
            <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-xl serif font-bold text-gray-800 mb-2 truncate" title={doc.title}>{doc.title}</h3>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Added: {doc.uploadedAt}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openViewer(doc.fileData)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#F8F7FC] text-[#7B68A6] rounded-xl font-bold text-xs hover:bg-[#E6D5F0] transition-all"
                >
                  <Eye size={16} /> View
                </button>
                <button
                  onClick={() => downloadDoc(doc.fileData, doc.title)}
                  className="flex items-center justify-center p-3 bg-white border border-[#E6D5F0] text-[#7B68A6] rounded-xl hover:bg-[#E6D5F0] transition-all"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {data.library.length === 0 && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-[4/5] md:h-full rounded-[32px] border-4 border-dashed border-[#E6D5F0] flex flex-col items-center justify-center text-[#B19CD9] hover:bg-[#F8F7FC] transition-all cursor-pointer p-8 text-center space-y-4"
          >
            <div className="p-6 bg-white rounded-3xl shadow-sm">
              <Plus size={48} className="opacity-40" />
            </div>
            <div>
              <p className="font-bold serif text-lg">Upload Your Own Guides</p>
              <p className="text-xs text-gray-400 mt-2">Personalize your library with your favorite PDFs.</p>
            </div>
          </div>
        )}
      </div>

      {/* PDF Viewer Overlay */}
      {showViewer && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex flex-col animate-in fade-in duration-300">
          <div className="flex items-center justify-between p-6 bg-white/5 border-b border-white/10">
            <h2 className="text-white font-bold serif text-xl">Document Viewer</h2>
            <button
              onClick={() => setShowViewer(null)}
              className="p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 bg-gray-900 overflow-hidden flex items-center justify-center p-4">
            <iframe
              src={showViewer}
              className="w-full h-full max-w-5xl bg-white rounded-2xl shadow-2xl"
              title="PDF Document"
              frameBorder="0"
            />
          </div>
          <div className="p-6 bg-white/5 border-t border-white/10 text-center">
            <p className="text-white/40 text-xs italic">Scroll to read. High-resolution PDF rendering enabled.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
