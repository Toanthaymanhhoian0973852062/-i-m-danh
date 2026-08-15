import re

with open("src/firebase.ts", "r") as f:
    content = f.read()

# Replace getFirestore initialization with initializeFirestore
replacement = """import { initializeFirestore } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
}, "ai-studio-tonthymnhhian-e8c8e17c-2e30-46cd-b7ff-713c6ce617ad");
"""

content = re.sub(
    r"const app = initializeApp\(firebaseConfig\);\s*export const db = getFirestore\(app, \"[^\"]+\"\);",
    replacement,
    content
)

with open("src/firebase.ts", "w") as f:
    f.write(content)
