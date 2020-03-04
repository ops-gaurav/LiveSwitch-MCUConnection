# LiveSwitch MCU Connection
The WebRTC based MCU connection for multiple people in a channel.

The complete documentation can be found at: 

- Server: https://help.frozenmountain.com/docs/liveswitch/server/installation
- Client: https://help.frozenmountain.com/docs/liveswitch/clients/javascript

# Instructions to run
The build when run on different devices, automatically represents the new user on each device. Hence, making
it easier to test across devices for augmenting multiple users.

Steps
- Open `interface.html` file in chrome or firefox.
- Enter a common channel name on each device to connect in a common channel.
- Click join to connect.

> Note: The solution is tested for conference of 4 people in parallel. This is just the PoC implementaion. The production implementation is subjected to more features with R&D on research and scalability