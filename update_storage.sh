#!/bin/bash
sed -i 's/TuitionRecord /TuitionRecord, GradeRecord /' src/services/storageService.ts
sed -i "s/MESSAGES: 'tm_messages_v3',/MESSAGES: 'tm_messages_v3',\n  GRADES: 'tm_grades_v3',/" src/services/storageService.ts
sed -i "s/KEYS.TUITION_RECORDS,/KEYS.TUITION_RECORDS,\n  KEYS.GRADES,/" src/services/storageService.ts

cat << 'INNER_EOF' >> src/services/storageService.ts

// Grades
export const getGradeRecords = (): GradeRecord[] => getStored(KEYS.GRADES, []);
export const saveGradeRecord = (record: GradeRecord) => {
  const records = getGradeRecords();
  const existing = records.findIndex(r => r.id === record.id);
  if (existing >= 0) {
    records[existing] = record;
  } else {
    records.push(record);
  }
  setStored(KEYS.GRADES, records);
};
export const deleteGradeRecord = (id: string) => {
  const records = getGradeRecords().filter(r => r.id !== id);
  setStored(KEYS.GRADES, records);
};
INNER_EOF
