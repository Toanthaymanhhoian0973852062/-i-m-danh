const fs = require('fs');
let code = fs.readFileSync('src/components/TeacherDashboard.tsx', 'utf8');

// replace todayDate logic
code = code.replace(
  `const todayDate = '2026-08-10';`,
  `const today = new Date();
  const todayDate = \`\${today.getFullYear()}-\${String(today.getMonth() + 1).padStart(2, '0')}-\${String(today.getDate()).padStart(2, '0')}\`;`
);

// create synthetic sessions logic
const syntheticLogic = `
  const isGroupScheduledToday = (schedule: string, dateObj: Date) => {
    const day = dateObj.getDay(); 
    const lowerSchedule = schedule.toLowerCase();
    
    if (day === 1) return lowerSchedule.includes('2') || lowerSchedule.includes('hai');
    if (day === 2) return lowerSchedule.includes('3') || lowerSchedule.includes('ba');
    if (day === 3) return lowerSchedule.includes('4') || lowerSchedule.includes('tư') || lowerSchedule.includes('tu');
    if (day === 4) return lowerSchedule.includes('5') || lowerSchedule.includes('năm') || lowerSchedule.includes('nam');
    if (day === 5) return lowerSchedule.includes('6') || lowerSchedule.includes('sáu') || lowerSchedule.includes('sau');
    if (day === 6) return lowerSchedule.includes('7') || lowerSchedule.includes('bảy') || lowerSchedule.includes('bay');
    if (day === 0) return lowerSchedule.includes('cn') || lowerSchedule.includes('chủ nhật') || lowerSchedule.includes('chu nhat');
    return false;
  };

  const recordedTodaySessions = sessions.filter((s) => s.date === todayDate);
  const recordedGroupIds = new Set(recordedTodaySessions.map(s => s.groupId));

  const pendingSessions: Session[] = groups
    .filter(g => g.status === 'active' && !recordedGroupIds.has(g.id) && isGroupScheduledToday(g.schedule, today))
    .map(g => ({
      id: 'synthetic_' + g.id,
      groupId: g.id,
      date: todayDate,
      startTime: g.startTime,
      endTime: g.endTime,
      isCompleted: false,
    }));

  const todaySessions = [...recordedTodaySessions, ...pendingSessions];
`;

code = code.replace(
  `const todaySessions = sessions.filter((s) => s.date === todayDate);`,
  syntheticLogic
);

// add handleOpenQuickAttendance
const handleLogic = `
  const handleOpenQuickAttendance = (ses: Session) => {
    if (ses.id.startsWith('synthetic_')) {
      const realSession = addSession({
        groupId: ses.groupId,
        date: ses.date,
        startTime: ses.startTime,
        endTime: ses.endTime,
        topic: ses.topic
      });
      onOpenQuickAttendance(realSession);
    } else {
      onOpenQuickAttendance(ses);
    }
  };
`;

code = code.replace(
  `const totalActiveStudents = students.filter((s) => s.status === 'active').length;`,
  `const totalActiveStudents = students.filter((s) => s.status === 'active').length;
${handleLogic}`
);

// replace onOpenQuickAttendance with handleOpenQuickAttendance in the render
code = code.replace(/onClick=\{\(\) => onOpenQuickAttendance\(ses\)\}/g, `onClick={() => handleOpenQuickAttendance(ses)}`);

fs.writeFileSync('src/components/TeacherDashboard.tsx', code);
console.log('done');
