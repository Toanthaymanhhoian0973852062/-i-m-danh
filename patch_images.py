import re

def replace_in_file(filepath, old_str, new_str):
    with open(filepath, "r") as f:
        content = f.read()
    
    # We will use regex to flexibly match the a tag containing ImageIcon
    content = re.sub(
        r"\{([^}]*\.imageUrl) && \(\s*<a href=\{[^}]*\.imageUrl\} target=\"_blank\" rel=\"noopener noreferrer\" className=\"[^\"]*\" title=\"[^\"]*\">\s*<ImageIcon className=\"[^\"]*\" />\s*</a>\s*\)\}",
        r"""{\1 && (
                            <a href={\1} target="_blank" rel="noopener noreferrer" className="block relative w-12 h-10 rounded-lg overflow-hidden border border-slate-200 hover:border-indigo-400 transition-colors bg-slate-100 shrink-0 shadow-sm" title="Bấm để xem ảnh phóng to">
                              <img src={\1} alt="Bài thi" className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                            </a>
                          )}""",
        content
    )
    
    with open(filepath, "w") as f:
        f.write(content)

replace_in_file("src/components/StudentView.tsx", "", "")
replace_in_file("src/components/ParentView.tsx", "", "")
replace_in_file("src/components/StudentManagement.tsx", "", "")
