import re

def update_file(filepath):
    with open(filepath, "r") as f:
        content = f.read()

    # Add state if not exists
    if "const [viewerImage, setViewerImage]" not in content:
        # Find a suitable place to add state, after another useState
        content = re.sub(
            r"(const \[activeSemester, setActiveSemester\] = useState<1 \| 2>\(1\);)",
            r"\1\n  const [viewerImage, setViewerImage] = useState<string | null>(null);",
            content
        )

    # In StudentManagement, it might not have activeSemester. Let's find another one.
    if "const [viewerImage, setViewerImage]" not in content:
        content = re.sub(
            r"(const \[searchTerm, setSearchTerm\] = useState\(''\);)",
            r"\1\n  const [viewerImage, setViewerImage] = useState<string | null>(null);",
            content
        )

    # Replace <a href={...}> with <button type="button" onClick={() => setViewerImage(...) }>
    content = re.sub(
        r'<a href=\{([^}]+)\} target="_blank" rel="noopener noreferrer" className="(block relative w-[^"]+)" title="([^"]+)">\s*<img src=\{([^}]+)\} alt="([^"]+)" className="([^"]+)" />\s*</a>',
        r'<button type="button" onClick={() => setViewerImage(\1)} className="\2" title="\3">\n                              <img src={\4} alt="\5" className="\6" />\n                            </button>',
        content
    )

    # Add modal before the closing div of the component
    modal_code = """
      {viewerImage && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setViewerImage(null)}>
          <img src={viewerImage} alt="Phóng to" className="max-w-full max-h-full rounded-xl object-contain shadow-2xl" onClick={e => e.stopPropagation()} />
          <button onClick={() => setViewerImage(null)} className="absolute top-4 right-4 text-white bg-slate-800/50 hover:bg-slate-800 rounded-full p-2">✕</button>
        </div>
      )}
    """
    
    # Only add if not already there
    if "setViewerImage(null)" not in content:
        content = re.sub(r"(</div>\s*\);\s*};\s*)$", r"{modal_code}\n\1".replace("{modal_code}", modal_code), content)

    with open(filepath, "w") as f:
        f.write(content)

update_file("src/components/StudentView.tsx")
update_file("src/components/ParentView.tsx")
update_file("src/components/StudentManagement.tsx")

