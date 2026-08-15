import re

with open("src/components/StudentView.tsx", "r") as f:
    content = f.read()

if "Upload" not in content:
    content = content.replace("Link } from 'lucide-react';", "Link, Upload } from 'lucide-react';")

# First, add the handleImageUpload and handlePaste logic
handlers = """  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        let scaleSize = 1;
        if (img.width > MAX_WIDTH) {
          scaleSize = MAX_WIDTH / img.width;
        }
        canvas.width = img.width * scaleSize;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        setEditImageUrl(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) handleImageUpload(blob);
      }
    }
  };

  const handleSaveGrade ="""

content = content.replace("  const handleSaveGrade =", handlers)

# Then replace the form part
form_replacement = """                        <div className="flex-1 min-w-[250px] md:max-w-md">
                           <form onSubmit={handleSaveGrade} className="space-y-2 bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
                              <div className="text-[10px] font-bold text-indigo-600 uppercase mb-1">Cập nhật điểm {gt.label}</div>
                              <div className="flex gap-2">
                                <input required type="number" step="0.1" min="0" max="10" placeholder="Điểm" value={editScore} onChange={e => setEditScore(e.target.value)} className="w-20 text-sm p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold text-center" />
                                <div className="flex-1 relative">
                                  <input type="text" placeholder="Link ảnh hoặc Ctrl+V dán ảnh" value={editImageUrl.startsWith('data:') ? '(Ảnh đã dán)' : editImageUrl} onChange={e => setEditImageUrl(e.target.value)} onPaste={handlePaste} className="w-full text-xs p-2 pr-8 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                                  <label className="absolute right-2 top-2 cursor-pointer text-slate-400 hover:text-indigo-600" title="Chọn file ảnh">
                                    <Upload className="w-4 h-4" />
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) handleImageUpload(e.target.files[0]);
                                    }} />
                                  </label>
                                </div>
                              </div>
                              {editImageUrl && (
                                <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 h-24 mt-2">
                                  <img src={editImageUrl} alt="Preview" className="w-full h-full object-contain" />
                                  <button type="button" onClick={() => setEditImageUrl('')} className="absolute top-1 right-1 bg-slate-900/50 text-white rounded-full p-1 hover:bg-red-500">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 mt-2">
                                <button type="button" onClick={() => setEditingGrade(null)} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">Hủy</button>
                                <button type="submit" className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Lưu điểm</button>
                              </div>
                           </form>
                        </div>"""

content = re.sub(r"                        <div className=\"flex-1 max-w-xs\">\s*<form onSubmit=\{handleSaveGrade\} className=\"space-y-2\">.*?</form>\s*</div>", form_replacement, content, flags=re.DOTALL)

with open("src/components/StudentView.tsx", "w") as f:
    f.write(content)
