import websocket
import time
import RPi.GPIO as GPIO # Import Raspberry Pi GPIO library
import traceback

from RPi_GPIO_Rotary import rotary

try:
    import thread
except ImportError:
    import _thread as thread

def on_message(ws, message):
    print(message)

def on_error(ws, error):
    print(error)

def on_close(ws):
    print("### closed ###")
    GPIO.cleanup() # Clean up
#time.sleep(5)
#obj.stop()


def on_open(ws):
    GPIO.setwarnings(False) # Ignore warning for now
#    GPIO.setmode(GPIO.BOARD) # Use physical pin numbering
    GPIO.setmode(GPIO.BCM) # Use physical pin numbering
    GPIO.setup(4, GPIO.IN, pull_up_down=GPIO.PUD_UP) # Set pin 10 to be an input pin and set initial value to be pulled low (off)
    GPIO.setup(15, GPIO.IN, pull_up_down=GPIO.PUD_UP) # Set pin 10 to be an input pin and set initial value to be pulled low (off)
    enc = rotary.Rotary(23,24,10,4)

    def cwTurn():
        print("CW Turn")
#        ws.send('{"topic": "physical/event/encoder-volume-turn", "payload": {"value": 1} }')
    def ccwTurn():
        print("CCW Turn")
#        ws.send('{"topic": "physical/event/encoder-volume-turn", "payload": {"value": -1} }')
    def buttonPushed():
        print("Button Pushed")
    def valueChanged(count):
        print(count)
        ws.send('{"topic": "physical/event/encoder-volume-turn", "payload": {"value": '+str(count)+'} }')

    try:
#      argh = rotary.Rotary(23,24,10,4)
      enc.register(increment=cwTurn, decrement=ccwTurn)
      enc.register(pressed=buttonPushed, onchange=valueChanged)
    except :
      print("argh")
      traceback.print_exc()
    def run(*args):
        ws.send('{"hello":"hello"}')
    def button_stop_callback(channel):
        print("Stop button was pushed!")
        ws.send('{"topic": "physical/event/button-stop-press"}')
    def button_start_callback(channel):
        print("Start button was pushed!")
        ws.send('{"topic": "physical/event/button-start-press"}')
    def stop_foo():
        GPIO.add_event_detect(4,GPIO.RISING,callback=button_stop_callback) # Setup event on pin 10 rising edge
    def start_foo():
        GPIO.add_event_detect(15,GPIO.RISING,callback=button_start_callback) # Setup event on pin 10 rising edge

    def start_enc():
        enc.start()

    thread.start_new_thread(run, ())
    thread.start_new_thread(stop_foo, ())
    thread.start_new_thread(start_foo, ())
    thread.start_new_thread(start_enc, ())

if __name__ == "__main__":
    ws = websocket.WebSocketApp("ws://0.0.0.0:8000",
                              on_message = on_message,
                              on_error = on_error,
                              on_close = on_close)
    ws.on_open = on_open
    ws.run_forever()
