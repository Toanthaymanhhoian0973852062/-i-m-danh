import re

with open("src/components/ParentView.tsx", "r") as f:
    content = f.read()

# Add mainTab state
content = content.replace("const [activeSemester, setActiveSemester] = useState<1 | 2>(1);", "const [activeSemester, setActiveSemester] = useState<1 | 2>(1);\n  const [mainTab, setMainTab] = useState<'attendance' | 'grades'>('attendance');")

# Replace everything after the header block
replacement = """      <div className="flex bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <button onClick={() => setMainTab('attendance')} className={`flex-1 py-3 text-sm font-bold uppercase transition-colors ${mainTab === 'attendance' ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>
          Chuyên cần & Lịch học
        </button>
        <button onClick={() => setMainTab('grades')} className={`flex-1 py-3 text-sm font-bold uppercase transition-colors ${mainTab === 'grades' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
          Báo cáo điểm số
        </button>
      </div>

      {mainTab === 'attendance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase mb-4 flex items-center space-x-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>TỔNG QUAN CHUYÊN CẦN</span>
              </h2>

              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">TỔNG BUỔI</span>
                  <strong className="text-slate-900 text-base">{stats?.totalSessions}</strong>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800">
                  <span className="block text-[10px]">🟢 CÓ MẶT</span>
                  <strong className="text-base">{stats?.presentCount}</strong>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800">
                  <span className="block text-[10px]">🟡 ĐI TRỄ</span>
                  <strong className="text-base">{stats?.lateCount}</strong>
                </div>
                <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-800">
                  <span className="block text-[10px]">🔴 VẮNG</span>
                  <strong className="text-base">{(stats?.excusedAbsentCount || 0) + (stats?.unexcusedAbsentCount || 0)}</strong>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>LỊCH SỬ ĐIỂM DANH GẦN ĐÂY</span>
              </h2>

              <div className="space-y-2">
                {myRecords.slice(0, 10).map((rec) => {
                  const ses = sessions.find((s) => s.id === rec.sessionId);
                  return (
                    <div key={rec.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">Ngày {ses?.date} ({ses?.startTime} – {ses?.endTime})</div>
                        <div className="text-[11px] text-slate-500">{ses?.topic}</div>
                        {rec.note && <div className="text-[10px] text-slate-500 mt-1 italic">"{rec.note}"</div>}
                      </div>
                      <div>
                        {rec.status === 'present' && <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">🟢 Có mặt</span>}
                        {rec.status === 'late' && <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full">🟡 Đi trễ</span>}
                        {rec.status === 'excused_absent' && <span className="bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-full">🔵 Vắng có phép</span>}
                        {rec.status === 'unexcused_absent' && <span className="bg-red-100 text-red-800 font-bold px-2.5 py-1 rounded-full">🔴 Vắng không phép</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase flex items-center space-x-2">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>LỊCH HỌC TOÁN</span>
              </h2>
              <div className="p-3 bg-teal-50 rounded-xl border border-teal-100 space-y-1 text-xs">
                <div className="font-bold text-teal-950">{group?.name}</div>
                <div className="text-slate-700">📅 Lịch: <strong>{group?.schedule}</strong></div>
                <div className="text-slate-700">⏰ Khung giờ: <strong>{group?.startTime} – {group?.endTime}</strong></div>
                <div className="text-slate-700">📍 {group?.location}</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase flex items-center space-x-2">
                <Phone className="w-4 h-4 text-slate-600" />
                <span>LIÊN HỆ GIÁO VIÊN</span>
              </h2>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                <a href="tel:0909123456" className="flex items-center space-x-2 text-slate-700 hover:text-emerald-600">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">📞</div>
                  <strong className="text-sm">0909 123 456</strong>
                </a>
                <a href="mailto:thaymanh@example.com" className="flex items-center space-x-2 text-slate-700 hover:text-emerald-600">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">✉️</div>
                  <span>thaymanh@example.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {mainTab === 'grades' && (
        <div className="grid grid-cols-1 gap-5">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase flex items-center space-x-2">
                <Book className="w-4 h-4 text-indigo-600" />
                <span>KẾT QUẢ HỌC TẬP</span>
              </h2>
              <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setActiveSemester(1)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeSemester === 1 ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Học Kỳ 1
                </button>
                <button
                  onClick={() => setActiveSemester(2)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeSemester === 2 ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Học Kỳ 2
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-xl border border-indigo-100">
              <div>
                <div className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">Trung bình Kì {activeSemester}</div>
                <div className="text-3xl font-black text-indigo-900">{avgScore}</div>
              </div>
              {isRewardEarned && (
                <div className="bg-emerald-100 text-emerald-800 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-200 shadow-sm">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span>Xuất sắc! Bé được Thầy thưởng quà 🎁</span>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-2">
              {GRADE_TYPES.map(gt => {
                const grade = grades.find(g => g.semester === activeSemester && g.type === gt.type);

                return (
                  <div key={gt.type} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between p-3">
                      <div className="flex-1">
                        <div className="font-bold text-slate-900 text-sm">{gt.label}</div>
                        <div className="text-[10px] text-slate-500">Hệ số: {gt.weight}</div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {grade?.imageUrl && (
                          <a href={grade.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 p-1 bg-blue-50 rounded-lg" title="Xem ảnh bài thi">
                            <ImageIcon className="w-4 h-4" />
                          </a>
                        )}
                        <div className={`w-12 h-10 flex items-center justify-center rounded-lg text-lg font-black ${grade ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-400'}`}>
                          {grade ? grade.score : '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
"""

content = re.sub(r"      <div className=\"grid grid-cols-1 md:grid-cols-3 gap-5\">.*", replacement, content, flags=re.DOTALL)

with open("src/components/ParentView.tsx", "w") as f:
    f.write(content)
