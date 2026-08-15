import re

with open("src/components/StudentManagement.tsx", "r") as f:
    content = f.read()

# Add ImageIcon to imports
if "Image as ImageIcon" not in content:
    content = content.replace("Banknote\n} from 'lucide-react';", "Banknote,\n  Image as ImageIcon\n} from 'lucide-react';")

replacement = """              const avg1 = calcAvg(1);
              const avg2 = calcAvg(2);

              const renderGradesList = (sem: 1 | 2) => {
                const semGrades = grades.filter(g => g.semester === sem && g.type);
                if (semGrades.length === 0) return null;
                
                return (
                  <div className="space-y-1 mt-2">
                    <div className="text-[10px] font-bold text-slate-500 mb-1">CHI TIẾT KỲ {sem}</div>
                    {GRADE_TYPES.map(gt => {
                      const g = semGrades.find(x => x.type === gt.type);
                      if (!g) return null;
                      return (
                        <div key={gt.type} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <div>
                            <div className="text-xs font-bold text-slate-800">{gt.type} <span className="text-[10px] text-slate-500 font-normal">({gt.weight}x)</span></div>
                          </div>
                          <div className="flex items-center gap-2">
                            {g.imageUrl && (
                              <a href={g.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 p-1 bg-blue-50 rounded flex items-center justify-center" title="Xem bài thi đối chiếu">
                                <ImageIcon className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <div className="font-black text-indigo-600 bg-indigo-100 w-8 h-8 flex items-center justify-center rounded">{g.score}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              };

              return (
                <div className="pt-3 border-t border-slate-100 space-y-2 max-h-64 overflow-y-auto">
                  <div className="text-xs font-bold text-slate-700 uppercase sticky top-0 bg-white py-1">Kết quả học tập (Đối chiếu)</div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="bg-indigo-50 p-2 rounded-xl border border-indigo-100 text-center">
                      <div className="text-[10px] text-indigo-600 font-bold">HỌC KỲ 1</div>
                      <div className="text-xl font-black text-indigo-900">{avg1}</div>
                    </div>
                    <div className="bg-indigo-50 p-2 rounded-xl border border-indigo-100 text-center">
                      <div className="text-[10px] text-indigo-600 font-bold">HỌC KỲ 2</div>
                      <div className="text-xl font-black text-indigo-900">{avg2}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>{renderGradesList(1)}</div>
                    <div>{renderGradesList(2)}</div>
                  </div>
                </div>
              );"""

content = re.sub(r"              const avg1 = calcAvg\(1\);\n              const avg2 = calcAvg\(2\);\n\n              return \(\n                <div className=\"pt-3 border-t border-slate-100 space-y-2\">\n                  <div className=\"text-xs font-bold text-slate-700 uppercase\">Trung bình điểm số<\/div>\n                  <div className=\"grid grid-cols-2 gap-2\">\n                    <div className=\"bg-indigo-50 p-2 rounded-xl border border-indigo-100 text-center\">\n                      <div className=\"text-\[10px\] text-indigo-600 font-bold\">HỌC KỲ 1<\/div>\n                      <div className=\"text-xl font-black text-indigo-900\">\{avg1\}<\/div>\n                    <\/div>\n                    <div className=\"bg-indigo-50 p-2 rounded-xl border border-indigo-100 text-center\">\n                      <div className=\"text-\[10px\] text-indigo-600 font-bold\">HỌC KỲ 2<\/div>\n                      <div className=\"text-xl font-black text-indigo-900\">\{avg2\}<\/div>\n                    <\/div>\n                  <\/div>\n                <\/div>\n              \);", replacement, content, flags=re.DOTALL)

with open("src/components/StudentManagement.tsx", "w") as f:
    f.write(content)
