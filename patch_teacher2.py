import re

with open("src/components/StudentManagement.tsx", "r") as f:
    content = f.read()

grades_code = """
            {(() => {
              const grades = getGradeRecords().filter(g => g.studentId === selectedStudentProfile.id);
              if (grades.length === 0) return null;
              return (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="text-xs font-bold text-slate-700 uppercase">Điểm số gần đây</div>
                  <div className="space-y-1">
                    {grades.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3).map(g => (
                      <div key={g.id} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <div>
                          <div className="text-xs font-bold text-slate-800">{g.examName}</div>
                          <div className="text-[10px] text-slate-500">{g.date}</div>
                        </div>
                        <div className="font-black text-indigo-600 bg-indigo-100 w-8 h-8 flex items-center justify-center rounded">{g.score}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
"""

content = content.replace("            <button\n              onClick={() => setSelectedStudentProfile(null)}", grades_code + "\n            <button\n              onClick={() => setSelectedStudentProfile(null)}")

with open("src/components/StudentManagement.tsx", "w") as f:
    f.write(content)

