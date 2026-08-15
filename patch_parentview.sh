#!/bin/bash
sed -i "s/import { getStudents/import { getGradeRecords, getStudents/" src/components/ParentView.tsx
sed -i "s/import { User }/import { User, GradeRecord }/" src/components/ParentView.tsx
sed -i "s/import { GraduationCap/import { GraduationCap, Book,/" src/components/ParentView.tsx
