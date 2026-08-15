import re

with open("src/services/storageService.ts", "r") as f:
    content = f.read()

content = content.replace(
"export const getTuitionRecords = (): TuitionRecord[] => getStored(KEYS.TUITION_RECORDS,\n  KEYS.GRADES,\n   []);",
"export const getTuitionRecords = (): TuitionRecord[] => getStored(KEYS.TUITION_RECORDS, []);"
)

content = content.replace(
"  setStored(KEYS.TUITION_RECORDS,\n  KEYS.GRADES, records);",
"  setStored(KEYS.TUITION_RECORDS, records);"
)

content = content.replace(
"  setStored(KEYS.TUITION_RECORDS,\n  KEYS.GRADES, allRecords);",
"  setStored(KEYS.TUITION_RECORDS, allRecords);"
)

with open("src/services/storageService.ts", "w") as f:
    f.write(content)
