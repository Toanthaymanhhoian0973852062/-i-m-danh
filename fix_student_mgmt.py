import re

with open("src/components/StudentManagement.tsx", "r") as f:
    content = f.read()

replacement = """              const grades = getGradeRecords().filter(g => g.studentId === selectedStudentProfile.id);
              if (grades.length === 0) return null;

              const GRADE_TYPES = [
                { type: 'TX1', weight: 1 }, { type: 'TX2', weight: 1 }, { type: 'TX3', weight: 1 }, { type: 'TX4', weight: 1 }, { type: 'TX5', weight: 1 },
                { type: 'GK', weight: 2 }, { type: 'CK', weight: 3 },
              ];

              const calcAvg = (sem) => {
                const sG = grades.filter(g => g.semester === sem && g.type);
                let tS = 0, tW = 0;
                sG.forEach(g => {
                  const gt = GRADE_TYPES.find(t => t.type === g.type);
                  const w = gt ? gt.weight : 1;
                  tS += g.score * w;
                  tW += w;
                });
                return tW > 0 ? (tS / tW).toFixed(1) : '?';
              };

              const avg1 = calcAvg(1);
              const avg2 = calcAvg(2);

              return (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="text-xs font-bold text-slate-700 uppercase">Trung bình điểm số</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-indigo-50 p-2 rounded-xl border border-indigo-100 text-center">
                      <div className="text-[10px] text-indigo-600 font-bold">HỌC KỲ 1</div>
                      <div className="text-xl font-black text-indigo-900">{avg1}</div>
                    </div>
                    <div className="bg-indigo-50 p-2 rounded-xl border border-indigo-100 text-center">
                      <div className="text-[10px] text-indigo-600 font-bold">HỌC KỲ 2</div>
                      <div className="text-xl font-black text-indigo-900">{avg2}</div>
                    </div>
                  </div>
                </div>
              );"""

content = re.sub(r"              const grades = getGradeRecords\(\).filter.*?<\/div>\n              \);\n", replacement, content, flags=re.DOTALL)

with open("src/components/StudentManagement.tsx", "w") as f:
    f.write(content)
