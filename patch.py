import re

with open("src/components/StudentView.tsx", "r") as f:
    content = f.read()

# Add states
state_code = """
  const [grades, setGrades] = useState<GradeRecord[]>(getGradeRecords().filter(g => g.studentId === student?.id));
  const [showGradeForm, setShowGradeForm] = useState(false);
  const [newGrade, setNewGrade] = useState<Partial<GradeRecord>>({});

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    const record: GradeRecord = {
      id: `grade_${Date.now()}`,
      studentId: student.id,
      examName: newGrade.examName || 'Kiểm tra',
      score: Number(newGrade.score) || 0,
      date: newGrade.date || new Date().toISOString().split('T')[0],
      subject: newGrade.subject || 'Toán',
      notes: newGrade.notes || '',
      createdAt: new Date().toISOString()
    };
    saveGradeRecord(record);
    setGrades(getGradeRecords().filter(g => g.studentId === student.id));
    setShowGradeForm(false);
    setNewGrade({});
  };

  const handleDeleteGrade = (id: string) => {
    if (confirm("Xóa điểm này?")) {
      deleteGradeRecord(id);
      setGrades(getGradeRecords().filter(g => g.studentId === student?.id));
    }
  };
"""

content = content.replace("  const myRecords = attendance.filter((a) => a.studentId === student?.id);", "  const myRecords = attendance.filter((a) => a.studentId === student?.id);\n" + state_code)

ui_code = """
        {/* GRADES SECTION */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase flex items-center space-x-2">
              <Book className="w-4 h-4 text-indigo-600" />
              <span>BÁO CÁO ĐIỂM SỐ</span>
            </h2>
            <button onClick={() => setShowGradeForm(!showGradeForm)} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition">
              <Plus className="w-3 h-3" />
              Báo điểm
            </button>
          </div>

          {showGradeForm && (
            <form onSubmit={handleSaveGrade} className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kỳ thi / Bài kiểm tra *</label>
                  <input required type="text" value={newGrade.examName || ''} onChange={e => setNewGrade({...newGrade, examName: e.target.value})} placeholder="Vd: Thi Giữa Kì 1" className="w-full text-sm p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Môn học</label>
                  <input type="text" value={newGrade.subject || 'Toán'} onChange={e => setNewGrade({...newGrade, subject: e.target.value})} className="w-full text-sm p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Điểm số *</label>
                  <input required type="number" step="0.1" min="0" max="10" value={newGrade.score || ''} onChange={e => setNewGrade({...newGrade, score: Number(e.target.value)})} className="w-full text-sm p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngày thi</label>
                  <input type="date" value={newGrade.date || ''} onChange={e => setNewGrade({...newGrade, date: e.target.value})} className="w-full text-sm p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú thêm</label>
                  <input type="text" value={newGrade.notes || ''} onChange={e => setNewGrade({...newGrade, notes: e.target.value})} className="w-full text-sm p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setShowGradeForm(false)} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-300 rounded-lg">Hủy</button>
                <button type="submit" className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg">Lưu điểm</button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {grades.length === 0 ? (
              <div className="text-center text-xs text-slate-500 py-4 bg-slate-50 rounded-xl border border-slate-100">
                Chưa có điểm nào được báo cáo.
              </div>
            ) : (
              grades.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(g => (
                <div key={g.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{g.examName}</div>
                    <div className="text-xs text-slate-500">{g.subject} • Ngày: {g.date}</div>
                    {g.notes && <div className="text-[10px] text-slate-400 mt-0.5">📝 {g.notes}</div>}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-black text-indigo-600 bg-indigo-50 w-10 h-10 flex items-center justify-center rounded-lg">{g.score}</div>
                    <button onClick={() => handleDeleteGrade(g.id)} className="text-slate-400 hover:text-red-500 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
"""

content = content.replace("        <div>", "        <div className=\"space-y-5\">\n" + ui_code)

with open("src/components/StudentView.tsx", "w") as f:
    f.write(content)

