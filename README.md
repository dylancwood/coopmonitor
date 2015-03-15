# coopmonitor

This project uses an Intel Edison (with add-on Seeed Grove components) and cloud services
to monitor a chicken coop. The NodeJS daemon code sends environment data to the ATT M2X service
where it is logged. If certain illegal conditions are met (e.g. Coop door closed during the day),
a text message is sent via Twilio. A NodeJS webserver running on Microsoft Azure provides
a web portal to inspect the current state of the coop, an to open/close the door.

A project description and photo can be found on the Hackster.io site:
http://www.hackster.io/4157/chicken-coop-monitor

The Seeed Grove shield pins used are in the config file: coopmonitor/config/default.json

    "boardPins": {
        "temperature": "A0",
        "battery": "A1",
        "motor": "D3",
        "door": "D2"
    }

Hardware Components List:

1x Intel Edison with Arduino breakout board
1x Seeed Grove Arduino Base Shield
1x Seeed Grove Temperature Sensor
1x Seeed Grove Roary Angle Sensor (used to simulate a battery voltage sensor)
1x Seeed Grove Mini Servo (to actuate the door in the model)
1x Seeed Grove Button (to sense door-open and door-closed states)
4x Seeed Grove cables


Note: Some simplifications were made for the small-scale proof of concept mode and
the following changes will need to be made for a full scale implementation:

1) The mini servo will be replaced with a DC motor relay circuit.

2) The Rotary angle sensor will be replaced with a DC voltage sensor circuit
and the error-bounds detection logic will be changed to match 12V battery specs.

