import os

def read_and_format_files(filenames):
    output = ""
    for filename in filenames:
        try:
            with open(filename, 'r') as file:
                content = file.read()
                output += f"{filename}:\n{content}\n\n"
        except FileNotFoundError:
            output += f"{filename}: File not found\n\n"
        except Exception as e:
            output += f"{filename}: An error occurred - {str(e)}\n\n"

    return output

def copy_to_clipboard(text):
    """ Copy given text to system clipboard. """
    try:
        with os.popen('pbcopy', 'w') as clipboard:
            clipboard.write(text)
            clipboard.close()
        print("Content copied to clipboard.")
    except Exception as e:
        print(f"Failed to copy content to clipboard: {str(e)}")

def main():
    files = ["background.js", "content.js", "manifest.json", "popup.js", "popup.html"]
    formatted_output = read_and_format_files(files)
    copy_to_clipboard(formatted_output)

if __name__ == "__main__":
    main()
