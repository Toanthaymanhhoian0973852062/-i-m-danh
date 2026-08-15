import re

with open("src/services/storageService.ts", "r") as f:
    content = f.read()

# Fix setStored
replacement = """function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(fallback) && !Array.isArray(parsed)) {
      console.warn(`Data type mismatch for key ${key}. Expected array but got ${typeof parsed}. Resetting.`);
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return parsed;
  } catch (err) {
    console.error(`Error loading key ${key}:`, err);
    return fallback;
  }
}

const setStored = <T>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
  pushToFirestore(key, data);
  listeners.forEach(listener => listener());
};"""

content = re.sub(r"function getStored<T>\(key: string, fallback: T\): T \{.*?(?=\n// Users)", replacement, content, flags=re.DOTALL)

# Fix the KEYS.GRADES typo in setStored
content = content.replace("setStored(KEYS.TUITION_RECORDS,\n  KEYS.GRADES,\n   records);", "setStored(KEYS.TUITION_RECORDS, records);")
content = content.replace("setStored(KEYS.TUITION_RECORDS,\n  KEYS.GRADES,\n   allRecords);", "setStored(KEYS.TUITION_RECORDS, allRecords);")

with open("src/services/storageService.ts", "w") as f:
    f.write(content)
