import re

with open("src/components/ParentView.tsx", "r") as f:
    content = f.read()

state_code = """
  const grades = getGradeRecords().filter(g => g.studentId === student?.id);
"""

content = content.replace("  const myRecords = attendance.filter((a) => a.studentId === student?.id);", "  const myRecords = attendance.filter((a) => a.studentId === student?.id);\n" + state_code)

ui_code = """
        {/* GRADES SECTION */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase flex items-center space-x-2 mb-4">
            <Book className="w-4 h-4 text-indigo-600" />
            <span>KẾT QUẢ HỌC TẬP</span>
          </h2>
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
                  <div className="text-lg font-black text-indigo-600 bg-indigo-50 w-10 h-10 flex items-center justify-center rounded-lg">{g.score}</div>
                </div>
              ))
            )}
          </div>
        </div>
"""

content = content.replace("        <div>", "        <div className=\"space-y-5\">\n" + ui_code)

with open("src/components/ParentView.tsx", "w") as f:
    f.write(content)

