import re

with open("src/types/index.ts", "r") as f:
    content = f.read()

replacement = """export type GradeType = 'TX1' | 'TX2' | 'TX3' | 'TX4' | 'TX5' | 'GK' | 'CK';

export interface GradeRecord {
  id: string;
  studentId: string;
  examName?: string; // legacy
  score: number;
  date?: string; // legacy
  subject?: string; // legacy
  notes?: string; // legacy
  semester?: 1 | 2;
  type?: GradeType;
  imageUrl?: string;
  createdAt: string;
}"""

content = re.sub(r"export interface GradeRecord \{.*?\}", replacement, content, flags=re.DOTALL)

with open("src/types/index.ts", "w") as f:
    f.write(content)
