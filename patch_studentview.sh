#!/bin/bash
# We'll use sed to insert the imports and the new state variables.

sed -i "s/import { getStudents/import { getGradeRecords, saveGradeRecord, deleteGradeRecord, getStudents/" src/components/StudentView.tsx
sed -i "s/import { User }/import { User, GradeRecord }/" src/components/StudentView.tsx
sed -i "s/import { GraduationCap/import { GraduationCap, Book, Plus, Trash2,/" src/components/StudentView.tsx
sed -i "s/import React from 'react';/import React, { useState } from 'react';/" src/components/StudentView.tsx
