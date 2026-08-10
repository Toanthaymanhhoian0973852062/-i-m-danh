const isGroupScheduledToday = (schedule, dateStr) => {
  const date = new Date(dateStr);
  const day = date.getDay(); 
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

console.log(isGroupScheduledToday('Thứ 2 - 4 - 6', '2026-08-10'));
console.log(isGroupScheduledToday('Thứ 3 - 5 - 7', '2026-08-10'));
