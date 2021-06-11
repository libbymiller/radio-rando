import time
import os
import re
import json
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import eyed3


class Watcher:
    DIRECTORY_TO_WATCH = "/opt/radiodan/rde/apps/rando/assets/audio"

    def __init__(self):
        self.observer = Observer()

    def run(self):
        event_handler = Handler()
        self.observer.schedule(event_handler, self.DIRECTORY_TO_WATCH, recursive=True)
        self.observer.start()
        try:
            while True:
                time.sleep(5)
        except:
            self.observer.stop()
            print("Error")

        self.observer.join()


class Handler(FileSystemEventHandler):

    @staticmethod
    def on_any_event(event):
        #print("event is",event)
        directory_to_save_in = "/opt/radiodan/rde/apps/rando/assets/songs_list"
        directory_to_watch  = "/opt/radiodan/rde/apps/rando/assets/audio"
        if event.is_directory:
            return None

        elif event.event_type == 'created' or event.event_type == 'deleted':
            # Take any action here when a file is first created.
            print("Received created or deleted event - %s." % event.src_path)
            arr = os.listdir(directory_to_watch)
            song_arr = []
            songs_lengths = []
            for fn in arr:
               if(re.search(r"mp3$", fn)):
                  song_arr.append(fn)
                  print("got",os.path.join(directory_to_watch, fn))
                  mp3_path = os.path.join(directory_to_watch, fn)
                  try:
                    duration = eyed3.load(mp3_path).info.time_secs
                    songs_lengths.append(int(duration/60))
                    print("duration",duration)
                  except:
                    print("failed to get duration")
            new_fn = os.path.join(directory_to_save_in, "songs.js")
            data = json.dumps(song_arr)
            data_lens = json.dumps(songs_lengths)
            with open(new_fn, 'w') as output:
               output.write("let filenames = " + data + ";\n")
               output.write("let filelengths = " + data_lens + ";\n")


  #      elif event.event_type == 'modified':
   #         # Taken any action here when a file is modified.
  #          print("Received modified event - %s." % event.src_path)


if __name__ == '__main__':
    w = Watcher()
    w.run()

