import os
import tkinter as tk
from tkinter import filedialog, messagebox

def combine_project_files():
    try:
        # Set up Tkinter window (hidden)
        root = tk.Tk()
        root.withdraw()
        root.after(100, lambda: root.wm_withdraw())

        # Select the root directory of the project
        root_dir = filedialog.askdirectory(title="Select the Root Directory of Your Next.js Project")
        if not root_dir:
            messagebox.showinfo("Info", "No root directory selected. Exiting.")
            return

        # Ask if the user wants to include all files from the entire project
        include_all = messagebox.askyesno(
            "Include Entire Project",
            "Do you want to include all .jsx, .js, and .css files from the entire project (root and all subdirectories)?"
        )

        directories = []
        include_subdirs = False

        if include_all:
            directories = [root_dir]
            include_subdirs = True
        else:
            # Select specific directories within the root
            messagebox.showinfo(
                "Instructions",
                "Now, select the directories within the root that contain .jsx, .js, or .css files. "
                "Choose each directory one by one and click 'Cancel' when done. "
                "Only directories within the root will be included."
            )
            while True:
                dir_path = filedialog.askdirectory(title="Select Directory within Your Next.js Project", initialdir=root_dir)
                if not dir_path:
                    break
                if not os.path.abspath(dir_path).startswith(os.path.abspath(root_dir) + os.sep):
                    messagebox.showwarning("Warning", f"Directory {dir_path} is not within the root directory {root_dir}. Skipping.")
                    continue
                directories.append(dir_path)

            if not directories:
                messagebox.showinfo("Info", "No directories selected. Exiting.")
                return

            # Ask about subdirectories for the selected directories
            include_subdirs = messagebox.askyesno(
                "Include Subdirectories",
                "Do you want to include .jsx, .js, and .css files from subdirectories of the selected directories?"
            )

        # Define file extensions to include
        extensions = ['.jsx', '.js', '.css']

        # Collect files with the specified extensions
        project_files = []
        for dir in directories:
            if include_subdirs:
                for root_dir_walk, _, files in os.walk(dir):
                    for file in files:
                        if any(file.lower().endswith(ext) for ext in extensions):
                            project_files.append(os.path.join(root_dir_walk, file))
            else:
                try:
                    files = os.listdir(dir)
                    for file in files:
                        if os.path.isfile(os.path.join(dir, file)) and any(file.lower().endswith(ext) for ext in extensions):
                            project_files.append(os.path.join(dir, file))
                except Exception as e:
                    messagebox.showerror("Error", f"Failed to access directory {dir}: {str(e)}")

        if not project_files:
            messagebox.showinfo("Info", "No .jsx, .js, or .css files found in the selected directories. Exiting.")
            return

        # Show number of files found
        messagebox.showinfo("Files Found", f"Found {len(project_files)} .jsx, .js, and .css files to combine.")

        # Choose where to save the combined file
        output_path = filedialog.asksaveasfilename(
            title="Save Combined File As",
            defaultextension=".txt",
            filetypes=[("Text Files", "*.txt"), ("All Files", "*.*")],
            initialfile="nextjs_project_files.txt"
        )

        if not output_path:
            messagebox.showinfo("Info", "Save canceled. Exiting.")
            return

        # Combine the files with relative paths
        processed_files = 0
        with open(output_path, 'w', encoding='utf-8') as outfile:
            # Write the root directory at the top
            outfile.write(f"Root directory: {root_dir}\n\n")

            for path in project_files:
                # Calculate relative path from root_dir and standardize to forward slashes
                relative_path = os.path.relpath(path, root_dir).replace('\\', '/')
                try:
                    with open(path, 'r', encoding='utf-8') as infile:
                        outfile.write(f"\n=== {relative_path} ===\n")
                        outfile.write(infile.read() + "\n")
                        processed_files += 1
                        print(f"Added: {relative_path}")
                except UnicodeDecodeError:
                    messagebox.showwarning(
                        "Skipped File",
                        f"Cannot read {relative_path} as text. Skipped."
                    )
                except Exception as e:
                    messagebox.showerror(
                        "Error",
                        f"Failed to process {relative_path}: {str(e)}"
                    )

        # Show completion message and open the output folder (Windows only)
        output_dir = os.path.dirname(output_path)
        os.startfile(output_dir)
        messagebox.showinfo(
            "Complete!",
            f"Processed {processed_files} files\nSaved to:\n{output_path}\n\n"
            f"File paths in the output are relative to:\n{root_dir}"
        )

    except Exception as e:
        messagebox.showerror("Critical Error", str(e))
    finally:
        root.destroy()

if __name__ == "__main__":
    combine_project_files()