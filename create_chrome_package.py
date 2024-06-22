import os
import shutil
import zipfile

def repackage_files(source_dir, files_to_include, output_zip_path):
    repackaged_dir = os.path.join(source_dir, 'agenata')
    os.makedirs(repackaged_dir, exist_ok=True)

    for file_name in files_to_include:
        src_path = os.path.join(source_dir, file_name)
        if os.path.exists(src_path):
            shutil.copy(src_path, repackaged_dir)
        else:
            print(f"Warning: {src_path} does not exist.")

    shutil.make_archive(output_zip_path.replace('.zip', ''), 'zip', repackaged_dir)

    shutil.rmtree(repackaged_dir)

if __name__ == "__main__":
    source_directory = '.'
    files_to_include = ["content.js", "manifest.json", "popup.js", "popup.html", "icon128.png"]
    output_zip_file = 'repackaged_agenata.zip'
    repackage_files(source_directory, files_to_include, output_zip_file)
    print(f"Repackaged zip file created at: {output_zip_file}")