import os

def clear_uploads(folder='uploads'):
    for f in os.listdir(folder):
        os.remove(os.path.join(folder, f))
